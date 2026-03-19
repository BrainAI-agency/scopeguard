import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import { Auth0Interrupt } from "@auth0/ai/interrupts";
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { setAIContext } from "@auth0/ai-vercel";
import {
  withInterruptions,
  errorSerializer,
} from "@auth0/ai-vercel/interrupts";
import { allTools } from "@/lib/tools";

export async function POST(req: Request) {
  const { id, messages } = await req.json();

  setAIContext({ threadID: id });

  const tools = allTools;

  const stream = createUIMessageStream({
    execute: withInterruptions(
      async ({ writer }) => {
        const result = streamText({
          model: bedrock("us.anthropic.claude-sonnet-4-6"),
          system: `You are ScopeGuard's AI assistant. You help users interact with their connected services (GitHub, Google Calendar, Gmail) through scoped, audited API access.

When a user asks you to do something, call the appropriate tool immediately. The authorization system handles permissions -- if the user hasn't connected a service, a consent prompt appears automatically.

After a tool returns results, summarize them clearly. Every tool call is logged in the audit system.`,
          messages: await convertToModelMessages(messages),
          tools,
        });

        // Merge stream into writer (starts sending chunks to client)
        writer.merge(result.toUIMessageStream());

        // Await completion, then check for Token Vault interrupts.
        // This throws AFTER the stream completes, so the error goes to onError.
        const steps = await result.steps;

        for (const step of steps) {
          for (const content of step.content) {
            if ("type" in content && content.type === "tool-error") {
              const err = (content as any).error;
              const isAuth0 =
                err instanceof Auth0Interrupt ||
                (err &&
                  String(err.message || err).startsWith(
                    "AUTH0_AI_INTERRUPT"
                  ));
              if (isAuth0) {
                throw {
                  cause: err,
                  toolCallId: (content as any).toolCallId,
                  toolName: (content as any).toolName,
                  toolArgs: (content as any).input,
                };
              }
            }
          }
        }
      },
      { messages, tools }
    ),
    onError: errorSerializer((err) => {
      console.error("[ScopeGuard] Stream error:", err);
      return "An error occurred while processing your request.";
    }),
  });

  return createUIMessageStreamResponse({ stream });
}
