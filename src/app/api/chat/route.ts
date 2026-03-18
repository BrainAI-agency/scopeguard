import {
  streamText,
  stepCountIs,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
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

When using tools:
- Always tell the user which service and scopes you're about to use
- Report results clearly and concisely
- If a tool call fails due to missing permissions, explain what's needed

You have access to these tools:
- listRepos: List the user's GitHub repositories
- getRepoFiles: Read files from a GitHub repository
- searchCode: Search code across the user's repositories
- getCalendarEvents: Get calendar events for a specific date
- checkAvailability: Check free/busy status for a date
- getInbox: Get recent emails from Gmail
- searchEmails: Search Gmail with a query

Every tool call you make is logged in the audit system. The user can review all actions in the Audit Log.`,
          messages: await convertToModelMessages(messages),
          tools,
          stopWhen: stepCountIs(5),
          onFinish: (output) => {
            if (output.finishReason === "tool-calls") {
              const lastContent = output.content[output.content.length - 1];
              if (
                lastContent &&
                "type" in lastContent &&
                lastContent.type === "tool-error"
              ) {
                throw {
                  cause: lastContent.error,
                  toolCallId: lastContent.toolCallId,
                  toolName: lastContent.toolName,
                  toolArgs: lastContent.input,
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
