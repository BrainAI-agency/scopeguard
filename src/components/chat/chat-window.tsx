"use client";

import { useChat } from "@ai-sdk/react";
import { useInterruptions } from "@auth0/ai-vercel/react";
import type { UIMessage } from "ai";
import { TokenVaultConsent } from "@/components/auth0-ai/TokenVault";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, Shield, Sparkles } from "lucide-react";
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

  const suggestions = [
    "What repos do I have on GitHub?",
    "What's on my calendar today?",
    "Show my recent emails",
    "Search my code for TODO comments",
  ];

  return (
    <div className="flex flex-1 flex-col">
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && (
            <div className="py-20 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15">
                <Sparkles className="h-8 w-8 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight">ScopeGuard Assistant</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Ask me about your GitHub repos, calendar events, or emails.
                Every action I take is audited and scoped.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {suggestions.map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant="outline"
                    className="cursor-pointer border-indigo-200/50 px-3.5 py-2 text-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
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
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 shadow-sm shadow-indigo-500/25">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/25"
                      : "border bg-card shadow-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{text}</div>
                </div>
                {message.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 shadow-sm shadow-indigo-500/25">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                Thinking...
              </div>
            </div>
          )}

          {/* Token Vault consent flow */}
          {toolInterrupt && (
            <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-5 shadow-sm">
              <TokenVaultConsent
                interrupt={{
                  connection: toolInterrupt.connection ?? "",
                  requiredScopes: toolInterrupt.requiredScopes ?? [],
                  resume: toolInterrupt.resume,
                }}
                connectWidget={{
                  icon: <Shield className="h-5 w-5 text-amber-600" />,
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

      <div className="border-t bg-card/80 p-4 backdrop-blur-sm">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-end gap-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your repos, calendar, or emails..."
            className="min-h-[44px] resize-none rounded-xl border-indigo-200/50 focus-visible:ring-indigo-500/30"
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
            className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
