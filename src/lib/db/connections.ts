import { ConnectionState } from "./schema";

// In-memory connection state store. Tracks which services are actively connected.
// Updated automatically when tool calls succeed (via audit-wrapper) and on explicit revoke.
const connectionStates: ConnectionState[] = [];
let nextId = 1;

export async function upsertConnection(
  userId: string,
  connection: string,
  provider: string,
  scopes: string[]
): Promise<ConnectionState> {
  const existing = connectionStates.find(
    (c) => c.userId === userId && c.connection === connection && c.status === "active"
  );

  if (existing) {
    existing.lastUsedAt = new Date().toISOString();
    existing.scopes = [...new Set([...existing.scopes, ...scopes])];
    return existing;
  }

  const state: ConnectionState = {
    id: nextId++,
    userId,
    connection,
    provider,
    scopes,
    connectedAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
    status: "active",
  };
  connectionStates.push(state);
  return state;
}

export async function revokeConnection(
  userId: string,
  connection: string
): Promise<boolean> {
  const entry = connectionStates.find(
    (c) => c.userId === userId && c.connection === connection && c.status === "active"
  );
  if (!entry) return false;
  entry.status = "revoked";
  return true;
}

export async function getConnections(userId: string): Promise<ConnectionState[]> {
  return connectionStates.filter((c) => c.userId === userId);
}

export async function getActiveConnections(userId: string): Promise<ConnectionState[]> {
  return connectionStates.filter((c) => c.userId === userId && c.status === "active");
}
