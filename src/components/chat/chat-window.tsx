"use client";

import { useChat } from "@ai-sdk/react";
import { useInterruptions } from "@auth0/ai-vercel/react";
import type { UIMessage } from "ai";
import { TokenVaultConsent } from "@/components/auth0-ai/TokenVault";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, Shield } from "lucide-react";
import { useRef, useEffect, useState, FormEvent } from "react";

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export function ChatWindow() {
  const { messages, sendMessage, status, toolInterrupt } = useInterruptions(
    (handler) =>
      useChat({
        onError: handler((e: Error) => {
          console.error("Chat error:", e.message);
        }),
        // Custom sendAutomaticallyWhen: only auto-send when tool calls
        // completed successfully. Do NOT auto-send on tool errors, because
        // Auth0 Token Vault interrupts arrive as tool-errors and need to
        // show the consent UI instead of retrying.
        sendAutomaticallyWhen: ({ messages: msgs }) => {
          const message = msgs[msgs.length - 1];
          if (!message || message.role !== "assistant") return false;

          const lastStepStartIndex = message.parts.reduce(
            (lastIndex: number, part: any, index: number) =>
              part.type === "step-start" ? index : lastIndex,
            -1
          );

          const toolParts = message.parts
            .slice(lastStepStartIndex + 1)
            .filter(
              (part: any) =>
                part.type === "tool-invocation" || part.type === "tool-result"
            );

          // Must have tool parts, all must be output-available (not output-error)
          return (
            toolParts.length > 0 &&
            toolParts.every((part: any) => part.state === "output-available")
          );
        },
      })
  );

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    await sendMessage({ text });
  };

  return (
    <div className="flex flex-1 flex-col">
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && (
            <div className="py-20 text-center">
              <Bot className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="text-xl font-semibold">ScopeGuard Assistant</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Ask me about your GitHub repos, calendar events, or emails.
                Every action I take is audited and scoped.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  "What repos do I have on GitHub?",
                  "What's on my calendar today?",
                  "Show my recent emails",
                  "Search my code for TODO comments",
                ].map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant="outline"
                    className="cursor-pointer px-3 py-1.5 text-sm hover:bg-accent"
                    onClick={() => {
                      setInput(suggestion);
                    }}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => {
            const text = getMessageText(message);
            if (!text) return null;

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{text}</div>
                </div>
                {message.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            </div>
          )}

          {/* Token Vault consent flow -- shown when a tool needs authorization */}
          {toolInterrupt && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <TokenVaultConsent
                interrupt={{
                  connection: toolInterrupt.connection ?? "",
                  requiredScopes: toolInterrupt.requiredScopes ?? [],
                  resume: toolInterrupt.resume,
                }}
                connectWidget={{
                  icon: <Shield className="h-5 w-5" />,
                  title: "Authorization Required",
                  description:
                    "The AI assistant needs access to a connected service. Click below to authorize.",
                  action: { label: "Authorize Access" },
                }}
                mode="auto"
              />
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-end gap-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your repos, calendar, or emails..."
            className="min-h-[44px] resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
