import { Header } from "@/components/layout/header";
import { ScopeExplainer } from "@/components/connect/scope-explainer";

export default function ConnectPage() {
  return (
    <>
      <Header
        title="Manage Connections"
        description="Connect services and see exactly what permissions you're granting."
      />
      <div className="flex-1 overflow-auto p-6">
        <ScopeExplainer />
      </div>
    </>
  );
}
