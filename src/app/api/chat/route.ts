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

  // Set thread context for Token Vault to track conversations
  setAIContext({ threadID: id });

  const tools = allTools;

  const stream = createUIMessageStream({
    execute: withInterruptions(
      async ({ writer }) => {
        const result = streamText({
          model: bedrock("us.anthropic.claude-sonnet-4-6"),
          system: `You are ScopeGuard's AI assistant. You help users interact with their connected services (GitHub, Google Calendar, Gmail) through scoped, audited API access.

IMPORTANT: When a user asks you to do something, ALWAYS call the appropriate tool immediately. Do not explain what you will do first. Do not ask for permission. Just call the tool. The authorization system will handle permissions automatically -- if the user hasn't connected a service yet, a consent prompt will appear for them.

After a tool returns results, summarize them clearly. Every tool call is logged in the audit system.`,
          messages: await convertToModelMessages(messages),
          tools,
          maxSteps: 5,
          onStepFinish: (step) => {
            // Intercept Token Vault interrupts BEFORE the model sees them as tool errors.
            // Without this, streamText feeds the error back to the model as a tool-error,
            // and the model generates a text fallback instead of triggering the consent flow.
            for (const content of step.content ?? []) {
              if (
                "type" in content &&
                content.type === "tool-error" &&
                content.error instanceof Auth0Interrupt
              ) {
                throw {
                  cause: content.error,
                  toolCallId: content.toolCallId,
                  toolName: content.toolName,
                  toolArgs: content.input,
                };
              }
            }
          },
        });

        writer.merge(result.toUIMessageStream());
      },
      { messages, tools }
    ),
    onError: errorSerializer((err) => {
      console.error("Stream error:", err);
      return "An error occurred while processing your request.";
    }),
  });

  return createUIMessageStreamResponse({ stream });
}
