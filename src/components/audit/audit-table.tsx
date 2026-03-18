"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuditEntry {
  id: number;
  toolName: string;
  connection: string;
  scopes: string[];
  apiEndpoint: string;
  status: "success" | "error";
  errorMessage: string | null;
  durationMs: number;
  createdAt: string;
}

export function AuditTable() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    try {
      const res = await fetch("/api/audit");
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries ?? []);
      }
    } catch {
      // Silent fail -- empty state handles it
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
    // Poll every 5 seconds for live updates
    const interval = setInterval(fetchEntries, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading audit log...</p>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <ScrollText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No audit entries yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            When the AI assistant accesses your connected services, every action
            will be logged here.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={fetchEntries}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {entries.length} action{entries.length !== 1 ? "s" : ""} logged
          </span>
          <Button variant="ghost" size="sm" onClick={fetchEntries}>
            <RefreshCw className="mr-2 h-3 w-3" />
            Refresh
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Tool</TableHead>
              <TableHead>API Endpoint</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleTimeString()}
                </TableCell>
                <TableCell className="font-medium">{entry.toolName}</TableCell>
                <TableCell className="max-w-[200px] truncate font-mono text-xs">
                  {entry.apiEndpoint}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{entry.connection}</Badge>
                </TableCell>
                <TableCell className="text-xs">{entry.durationMs}ms</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      entry.status === "success" ? "default" : "destructive"
                    }
                  >
                    {entry.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
