import { Header } from "@/components/layout/header";
import { AuditTable } from "@/components/audit/audit-table";

export default function AuditPage() {
  return (
    <>
      <Header
        title="Audit Log"
        description="Every action your AI agent has taken, with full details."
      />
      <div className="flex-1 overflow-auto p-6">
        <AuditTable />
      </div>
    </>
  );
}
