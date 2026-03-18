"use client";

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
  AlertTriangle,
  Shield,
} from "lucide-react";
import { connections } from "@/lib/scope-metadata";

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

export function ScopeExplainer() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-4">
        <Shield className="h-5 w-5 text-primary" />
        <p className="text-sm text-muted-foreground">
          Before connecting a service, review exactly what permissions the AI
          assistant will receive. All access is read-only.
        </p>
      </div>

      {connections.map((conn) => {
        const Icon = iconMap[conn.icon] || ExternalLink;

        return (
          <Card key={conn.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {conn.name}
                </span>
                <Button size="sm">Connect {conn.name}</Button>
              </CardTitle>
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
