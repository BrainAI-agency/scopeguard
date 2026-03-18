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

const riskColors: Record<string, string> = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-red-600",
};

// Map scope-metadata connection IDs to API connection names
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
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-4">
        <Shield className="h-5 w-5 text-primary" />
        <p className="text-sm text-muted-foreground">
          Before connecting a service, review exactly what permissions the AI
          assistant will receive. All access is read-only. You can revoke at any
          time.
        </p>
      </div>

      {connections.map((conn) => {
        const Icon = iconMap[conn.icon] || ExternalLink;
        const state = getState(conn.id);
        const isConnected = state?.isConnected ?? false;
        const apiConnName = connectionIdMap[conn.id];
        const isRevoking = revoking === apiConnName;

        return (
          <Card key={conn.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {conn.name}
                  {isConnected && (
                    <Badge variant="default" className="ml-2">
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
                  <Button size="sm" onClick={() => router.push("/chat")}>
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
              {conn.scopes.map((scope, idx) => (
                <div key={scope.scope}>
                  {idx > 0 && <Separator className="mb-6" />}

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        {scope.scope}
                      </Badge>
                      <span className="font-medium">{scope.name}</span>
                      <Badge
                        variant="secondary"
                        className={riskColors[scope.risk]}
                      >
                        {scope.risk} risk
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {scope.description}
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                          What the agent CAN do
                        </p>
                        <ul className="space-y-1">
                          {scope.canDo.map((item) => (
                            <li
                              key={item}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Check className="h-3.5 w-3.5 text-green-600" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                          What the agent CANNOT do
                        </p>
                        <ul className="space-y-1">
                          {scope.cannotDo.map((item) => (
                            <li
                              key={item}
                              className="flex items-center gap-2 text-sm"
                            >
                              <X className="h-3.5 w-3.5 text-red-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
