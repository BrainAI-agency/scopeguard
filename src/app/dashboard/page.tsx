import { Header } from "@/components/layout/header";
import { ConnectionCards } from "@/components/dashboard/connection-cards";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Permission Dashboard"
        description="Monitor and control what your AI agent can access."
      />
      <div className="flex-1 space-y-6 overflow-auto p-6">
        <StatsBar />
        <ConnectionCards />
        <ActivityFeed />
      </div>
    </>
  );
}
