import { logAudit } from "./db/audit";
import { auth0 } from "./auth0";

/**
 * Logs a tool call to the audit system. Call this inside tool execute functions.
 * ScopeGuard's core differentiator: full visibility into agent actions.
 */
export async function auditToolCall(opts: {
  toolName: string;
  connection: string;
  scopes: string[];
  apiEndpoint?: string;
  apiMethod?: string;
  status: "success" | "error";
  errorMessage?: string;
  durationMs: number;
}) {
  let userId = "anonymous";
  try {
    const session = await auth0.getSession();
    userId = session?.user?.sub ?? "anonymous";
  } catch {
    // Session unavailable in edge/middleware context
  }

  await logAudit({
    userId,
    connection: opts.connection,
    toolName: opts.toolName,
    scopes: opts.scopes,
    apiEndpoint: opts.apiEndpoint ?? opts.toolName,
    apiMethod: opts.apiMethod ?? "GET",
    status: opts.status,
    errorMessage: opts.errorMessage ?? null,
    durationMs: opts.durationMs,
  });
}
