"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Github,
  Calendar,
  Mail,
  ExternalLink,
  Check,
  X,
  Shield,
  Clock,
  Loader2,
} from "lucide-react";
import { connections } from "@/lib/scope-metadata";
import { useRouter } from "next/navigation";

interface LiveConnection {
  connection: string;
  isConnected: boolean;
  connectedAt: string | null;
  lastUsedAt: string | null;
}

const iconMap: Record<string, React.ElementType> = {
  github: Github,
  calendar: Calendar,
  mail: Mail,
};

const iconColors: Record<string, { bg: string; text: string }> = {
  github: { bg: "from-gray-500/15 to-gray-600/15", text: "text-gray-700" },
  calendar: { bg: "from-blue-500/15 to-indigo-500/15", text: "text-blue-600" },
  mail: { bg: "from-red-500/15 to-rose-500/15", text: "text-red-600" },
};

const riskConfig: Record<string, { color: string; bg: string }> = {
  low: { color: "text-emerald-700", bg: "bg-emerald-100" },
  medium: { color: "text-amber-700", bg: "bg-amber-100" },
  high: { color: "text-red-700", bg: "bg-red-100" },
};

const connectionIdMap: Record<string, string> = {
  github: "github",
  "google-calendar": "google-oauth2",
  gmail: "google-oauth2",
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

export function ScopeExplainer() {
  const [liveState, setLiveState] = useState<LiveConnection[]>([]);
  const [revoking, setRevoking] = useState<string | null>(null);
  const router = useRouter();

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/connections");
      if (res.ok) {
        const data = await res.json();
        setLiveState(
          (data.connections ?? []).map((c: { connection: string; isConnected: boolean; connectedAt: string | null; lastUsedAt: string | null }) => ({
            connection: c.connection,
            isConnected: c.isConnected,
            connectedAt: c.connectedAt,
            lastUsedAt: c.lastUsedAt,
          }))
        );
      }
    } catch {
      // Silent fail
    }
  }, []);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, [fetchState]);

  const handleRevoke = async (connectionName: string) => {
    setRevoking(connectionName);
    try {
      const res = await fetch("/api/connections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection: connectionName }),
      });
      if (res.ok) {
        await fetchState();
      }
    } finally {
      setRevoking(null);
    }
  };

  const getState = (connId: string): LiveConnection | undefined => {
    const apiName = connectionIdMap[connId];
    return liveState.find((s) => s.connection === apiName);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl border border-indigo-200/50 bg-gradient-to-r from-indigo-50/80 to-violet-50/80 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600">
          <Shield className="h-4.5 w-4.5 text-white" />
        </div>
        <p className="text-sm text-muted-foreground">
          Before connecting a service, review exactly what permissions the AI
          assistant will receive. All access is read-only. You can revoke at any
          time.
        </p>
      </div>

      {connections.map((conn) => {
        const Icon = iconMap[conn.icon] || ExternalLink;
        const colors = iconColors[conn.icon] || { bg: "from-indigo-500/15 to-violet-500/15", text: "text-indigo-600" };
        const state = getState(conn.id);
        const isConnected = state?.isConnected ?? false;
        const apiConnName = connectionIdMap[conn.id];
        const isRevoking = revoking === apiConnName;

        return (
          <Card key={conn.id} className="border-0 shadow-md shadow-indigo-500/5">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${colors.bg}`}>
                    <Icon className={`h-4.5 w-4.5 ${colors.text}`} />
                  </div>
                  <span className="text-lg">{conn.name}</span>
                  {isConnected && (
                    <Badge className="ml-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      Connected
                    </Badge>
                  )}
                </span>
                {isConnected ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isRevoking}
                    onClick={() => handleRevoke(apiConnName)}
                  >
                    {isRevoking ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Revoking...
                      </>
                    ) : (
                      "Revoke Access"
                    )}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700"
                    onClick={() => router.push("/chat")}
                  >
                    Connect via Chat
                  </Button>
                )}
              </CardTitle>
              {isConnected && state?.lastUsedAt && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Last used: {formatTimestamp(state.lastUsedAt)}
                  {state.connectedAt && (
                    <span className="ml-2">
                      Connected: {formatTimestamp(state.connectedAt)}
                    </span>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {conn.scopes.map((scope, idx) => {
                const risk = riskConfig[scope.risk] || riskConfig.low;
                return (
                  <div key={scope.scope}>
                    {idx > 0 && <Separator className="mb-6" />}

                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Badge variant="outline" className="border-indigo-200/50 font-mono text-xs">
                          {scope.scope}
                        </Badge>
                        <span className="font-medium">{scope.name}</span>
                        <Badge
                          variant="secondary"
                          className={`${risk.bg} ${risk.color}`}
                        >
                          {scope.risk} risk
                        </Badge>
                      </div>

                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {scope.description}
                      </p>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-emerald-200/50 bg-emerald-50/50 p-4">
                          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                            What the agent CAN do
                          </p>
                          <ul className="space-y-1.5">
                            {scope.canDo.map((item) => (
                              <li
                                key={item}
                                className="flex items-center gap-2 text-sm"
                              >
                                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-lg border border-red-200/50 bg-red-50/50 p-4">
                          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-red-700">
                            What the agent CANNOT do
                          </p>
                          <ul className="space-y-1.5">
                            {scope.cannotDo.map((item) => (
                              <li
                                key={item}
                                className="flex items-center gap-2 text-sm"
                              >
                                <X className="h-3.5 w-3.5 shrink-0 text-red-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
