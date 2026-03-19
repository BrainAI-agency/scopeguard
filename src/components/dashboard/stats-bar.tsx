"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Activity, CheckCircle2, Link2 } from "lucide-react";

interface AuditStats {
  totalCalls: number;
  callsToday: number;
  successRate: number;
  connectionBreakdown: Record<string, number>;
}

const statConfig = [
  {
    key: "connections",
    label: "Connected Services",
    icon: Link2,
    gradient: "from-blue-500/15 to-indigo-500/15",
    iconColor: "text-blue-600",
  },
  {
    key: "callsToday",
    label: "API Calls Today",
    icon: Activity,
    gradient: "from-indigo-500/15 to-violet-500/15",
    iconColor: "text-indigo-600",
  },
  {
    key: "successRate",
    label: "Success Rate",
    icon: CheckCircle2,
    gradient: "from-emerald-500/15 to-teal-500/15",
    iconColor: "text-emerald-600",
  },
  {
    key: "total",
    label: "Total Actions",
    icon: Shield,
    gradient: "from-violet-500/15 to-purple-500/15",
    iconColor: "text-violet-600",
  },
];

export function StatsBar() {
  const [stats, setStats] = useState<AuditStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/audit?stats=true&limit=0");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats ?? null);
        }
      } catch {
        // Silent fail
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeConnections = stats
    ? Object.keys(stats.connectionBreakdown).length
    : 0;

  const values: Record<string, string> = {
    connections: String(activeConnections),
    callsToday: String(stats?.callsToday ?? 0),
    successRate: `${stats?.successRate ?? 100}%`,
    total: String(stats?.totalCalls ?? 0),
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {statConfig.map((stat) => (
        <Card key={stat.key} className="border-0 shadow-md shadow-indigo-500/5 transition-shadow hover:shadow-lg">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient}`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{values[stat.key]}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
