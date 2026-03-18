"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Calendar, Mail, ExternalLink } from "lucide-react";
import { connections } from "@/lib/scope-metadata";

const iconMap: Record<string, React.ElementType> = {
  github: Github,
  calendar: Calendar,
  mail: Mail,
};

export function ConnectionCards() {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Connected Services</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {connections.map((conn) => {
          const Icon = iconMap[conn.icon] || ExternalLink;
          // TODO: Check actual connection status from Auth0
          const isConnected = false;

          return (
            <Card key={conn.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <Icon className="h-5 w-5" />
                  {conn.name}
                </CardTitle>
                <Badge variant={isConnected ? "default" : "secondary"}>
                  {isConnected ? "Connected" : "Not Connected"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="mb-3 space-y-1">
                  {conn.scopes.map((scope) => (
                    <div key={scope.scope} className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs font-normal"
                      >
                        {scope.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {scope.risk} risk
                      </span>
                    </div>
                  ))}
                </div>
                {isConnected ? (
                  <Button variant="destructive" size="sm" className="w-full">
                    Revoke Access
                  </Button>
                ) : (
                  <Button size="sm" className="w-full">
                    Connect
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
