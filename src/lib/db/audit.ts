import { AuditEntry } from "./schema";

// In-memory audit store for now. Will swap to SQLite/Postgres when we decide on deployment.
// This keeps us unblocked and the interface is the same either way.
const auditLog: AuditEntry[] = [];
let nextId = 1;

export async function logAudit(entry: Omit<AuditEntry, "id" | "createdAt">): Promise<AuditEntry> {
  const record: AuditEntry = {
    ...entry,
    id: nextId++,
    createdAt: new Date().toISOString(),
  };
  auditLog.unshift(record);
  // Keep max 1000 entries in memory
  if (auditLog.length > 1000) auditLog.pop();
  return record;
}

export async function getAuditLog(
  userId: string,
  filters?: { connection?: string; status?: string; limit?: number }
): Promise<AuditEntry[]> {
  let entries = auditLog.filter((e) => e.userId === userId);
  if (filters?.connection) {
    entries = entries.filter((e) => e.connection === filters.connection);
  }
  if (filters?.status) {
    entries = entries.filter((e) => e.status === filters.status);
  }
  return entries.slice(0, filters?.limit ?? 50);
}

export async function getAuditStats(userId: string) {
  const entries = auditLog.filter((e) => e.userId === userId);
  const today = new Date().toISOString().split("T")[0];
  const todayEntries = entries.filter((e) => e.createdAt.startsWith(today));

  return {
    totalCalls: entries.length,
    callsToday: todayEntries.length,
    successRate: entries.length > 0
      ? Math.round((entries.filter((e) => e.status === "success").length / entries.length) * 100)
      : 100,
    connectionBreakdown: entries.reduce<Record<string, number>>((acc, e) => {
      acc[e.connection] = (acc[e.connection] || 0) + 1;
      return acc;
    }, {}),
  };
}
