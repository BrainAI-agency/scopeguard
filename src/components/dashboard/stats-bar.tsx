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

  const items = [
    {
      label: "Connected Services",
      value: String(activeConnections),
      icon: Link2,
    },
    {
      label: "API Calls Today",
      value: String(stats?.callsToday ?? 0),
      icon: Activity,
    },
    {
      label: "Success Rate",
      value: `${stats?.successRate ?? 100}%`,
      icon: CheckCircle2,
    },
    {
      label: "Total Actions",
      value: String(stats?.totalCalls ?? 0),
      icon: Shield,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-primary/10 p-2">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
