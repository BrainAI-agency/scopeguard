"use client";

import { Header } from "@/components/layout/header";
import { ChatWindow } from "@/components/chat/chat-window";

export default function ChatPage() {
  return (
    <>
      <Header
        title="AI Assistant"
        description="Ask questions about your GitHub repos, calendar, and email. All actions are scoped and audited."
      />
      <ChatWindow />
    </>
  );
}
