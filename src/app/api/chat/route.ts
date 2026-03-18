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
          onFinish: (output) => {
            console.log("[DEBUG-FIX] onFinish:", JSON.stringify({
              finishReason: output.finishReason,
              contentLen: output.content?.length,
              contentTypes: output.content?.map((c: any) => c.type),
              lastErrorType: output.content?.filter((c: any) => c.type === "tool-error").map((c: any) => ({
                name: c.error?.constructor?.name,
                isAuth0: c.error instanceof Auth0Interrupt,
                msg: String(c.error).slice(0, 100),
              })),
            }));
            if (output.finishReason === "tool-calls") {
              const lastContent = output.content[output.content.length - 1];
              if (
                lastContent &&
                "type" in lastContent &&
                lastContent.type === "tool-error"
              ) {
                const err = (lastContent as any).error;
                if (err instanceof Auth0Interrupt) {
                  throw {
                    cause: err,
                    toolCallId: (lastContent as any).toolCallId,
                    toolName: (lastContent as any).toolName,
                    toolArgs: (lastContent as any).input,
                  };
                }
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
