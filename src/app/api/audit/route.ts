import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getAuditLog, getAuditStats } from "@/lib/db/audit";

export async function GET(req: Request) {
  const session = await auth0.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const connection = url.searchParams.get("connection") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);
  const includeStats = url.searchParams.get("stats") === "true";

  const userId = session.user.sub;
  const entries = await getAuditLog(userId, { connection, status, limit });

  if (includeStats) {
    const stats = await getAuditStats(userId);
    return NextResponse.json({ entries, stats });
  }

  return NextResponse.json({ entries });
}
