import { Shell } from "@/components/layout/shell";

export default function AuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Shell>{children}</Shell>;
}
