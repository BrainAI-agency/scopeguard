"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity } from "lucide-react";

interface ActivityEntry {
  id: number;
  toolName: string;
  connection: string;
  status: "success" | "error";
  createdAt: string;
  durationMs: number;
}

export function ActivityFeed() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch("/api/audit?limit=10");
        if (res.ok) {
          const data = await res.json();
          setEntries(data.entries ?? []);
        }
      } catch {
        // Silent fail
      }
    };

    fetchActivity();
    const interval = setInterval(fetchActivity, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-0 shadow-md shadow-indigo-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/15 to-violet-500/15">
            <Activity className="h-3.5 w-3.5 text-indigo-600" />
          </div>
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-indigo-200/50 py-10 text-center">
            <Activity className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No activity yet. Start a conversation with the AI assistant to see
              actions logged here.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border border-transparent bg-muted/50 p-3 transition-colors hover:border-indigo-200/30 hover:bg-muted"
                >
                  <div>
                    <p className="text-sm font-medium">{entry.toolName}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.connection} &middot; {entry.durationMs}ms
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        entry.status === "success" ? "default" : "destructive"
                      }
                      className={entry.status === "success" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}
                    >
                      {entry.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
