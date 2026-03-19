"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Calendar, Mail, ExternalLink, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ConnectionScope {
  scope: string;
  name: string;
  description: string;
  sensitivity: string;
}

interface ConnectionData {
  id: string;
  provider: string;
  connection: string;
  icon: string;
  scopes: ConnectionScope[];
  tools: string[];
  isConnected: boolean;
  connectedAt: string | null;
  lastUsedAt: string | null;
  activeScopes: string[];
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

export function ConnectionCards() {
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  const [revoking, setRevoking] = useState<string | null>(null);
  const router = useRouter();

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/connections");
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections ?? []);
      }
    } catch {
      // Silent fail
    }
  }, []);

  useEffect(() => {
    fetchConnections();
    const interval = setInterval(fetchConnections, 5000);
    return () => clearInterval(interval);
  }, [fetchConnections]);

  const handleRevoke = async (connection: string) => {
    setRevoking(connection);
    try {
      const res = await fetch("/api/connections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection }),
      });
      if (res.ok) {
        await fetchConnections();
      }
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold tracking-tight">Connected Services</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {connections.map((conn) => {
          const Icon = iconMap[conn.icon] || ExternalLink;
          const colors = iconColors[conn.icon] || { bg: "from-indigo-500/15 to-violet-500/15", text: "text-indigo-600" };
          const isRevoking = revoking === conn.connection;

          return (
            <Card key={conn.id} className="border-0 shadow-md shadow-indigo-500/5 transition-all hover:shadow-lg hover:-translate-y-0.5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2.5 text-base font-medium">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${colors.bg}`}>
                    <Icon className={`h-4 w-4 ${colors.text}`} />
                  </div>
                  {conn.provider}
                </CardTitle>
                <Badge
                  variant={conn.isConnected ? "default" : "secondary"}
                  className={conn.isConnected ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}
                >
                  {conn.isConnected ? "Connected" : "Not Connected"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="mb-3 space-y-1.5">
                  {conn.scopes.map((scope) => (
                    <div key={scope.scope} className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-indigo-200/50 text-xs font-normal"
                      >
                        {scope.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {scope.sensitivity} risk
                      </span>
                    </div>
                  ))}
                </div>

                {conn.isConnected && conn.lastUsedAt && (
                  <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Last used: {formatTimestamp(conn.lastUsedAt)}
                  </div>
                )}

                {conn.isConnected ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    disabled={isRevoking}
                    onClick={() => handleRevoke(conn.connection)}
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
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700"
                    onClick={() => router.push("/chat")}
                  >
                    Connect via Chat
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
