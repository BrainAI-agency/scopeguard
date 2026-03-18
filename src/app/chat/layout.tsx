import { Shell } from "@/components/layout/shell";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Shell>{children}</Shell>;
}
