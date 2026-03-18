import { Shell } from "@/components/layout/shell";

export default function ConnectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Shell>{children}</Shell>;
}
