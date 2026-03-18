// Audit log entry shape
export interface AuditEntry {
  id: number;
  userId: string;
  connection: string;
  toolName: string;
  scopes: string[];
  apiEndpoint: string;
  apiMethod: string;
  status: "success" | "error";
  errorMessage: string | null;
  durationMs: number;
  createdAt: string;
}

// Connection state cached from Token Vault
export interface ConnectionState {
  id: number;
  userId: string;
  connection: string;
  provider: string;
  scopes: string[];
  connectedAt: string;
  lastUsedAt: string | null;
  status: "active" | "revoked";
}
