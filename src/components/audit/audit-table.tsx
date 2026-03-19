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
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
    const interval = setInterval(fetchEntries, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="border-0 shadow-md shadow-indigo-500/5">
        <CardContent className="py-16 text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm text-muted-foreground">Loading audit log...</p>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="border-0 shadow-md shadow-indigo-500/5">
        <CardContent className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15">
            <ScrollText className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold">No audit entries yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            When the AI assistant accesses your connected services, every action
            will be logged here.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-indigo-200/50"
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
    <Card className="border-0 shadow-md shadow-indigo-500/5">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
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
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Time</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tool</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">API Endpoint</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Service</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Duration</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id} className="transition-colors hover:bg-indigo-50/30">
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleTimeString()}
                </TableCell>
                <TableCell className="font-medium">{entry.toolName}</TableCell>
                <TableCell className="max-w-[200px] truncate font-mono text-xs text-muted-foreground">
                  {entry.apiEndpoint}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-indigo-200/50">{entry.connection}</Badge>
                </TableCell>
                <TableCell className="tabular-nums text-xs">{entry.durationMs}ms</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      entry.status === "success" ? "default" : "destructive"
                    }
                    className={entry.status === "success" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}
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
