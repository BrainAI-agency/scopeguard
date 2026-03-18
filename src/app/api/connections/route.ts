import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getConnections, revokeConnection } from "@/lib/db/connections";

// Static connection definitions -- what ScopeGuard can connect to.
const CONNECTION_DEFS = [
  {
    id: "github",
    provider: "GitHub",
    connection: "github",
    icon: "github",
    scopes: [
      {
        scope: "read:user",
        name: "User Profile",
        description: "Read your GitHub profile information",
        sensitivity: "low",
      },
      {
        scope: "repo",
        name: "Repositories",
        description: "Read and list your public and private repositories",
        sensitivity: "high",
      },
    ],
    tools: ["listRepos", "getRepoFiles", "searchCode"],
  },
  {
    id: "google-calendar",
    provider: "Google Calendar",
    connection: "google-oauth2",
    icon: "calendar",
    scopes: [
      {
        scope: "https://www.googleapis.com/auth/calendar.readonly",
        name: "Calendar (Read-only)",
        description: "View your calendar events and free/busy status",
        sensitivity: "medium",
      },
    ],
    tools: ["getCalendarEvents", "checkAvailability"],
  },
  {
    id: "gmail",
    provider: "Gmail",
    connection: "google-oauth2",
    icon: "mail",
    scopes: [
      {
        scope: "https://www.googleapis.com/auth/gmail.readonly",
        name: "Gmail (Read-only)",
        description: "Read your email messages and search your inbox",
        sensitivity: "high",
      },
    ],
    tools: ["getInbox", "searchEmails"],
  },
];

export async function GET() {
  const session = await auth0.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.sub;
  const activeStates = await getConnections(userId);

  // Merge static definitions with live connection state
  const connections = CONNECTION_DEFS.map((def) => {
    const state = activeStates.find(
      (s) => s.connection === def.connection && s.status === "active"
    );
    return {
      ...def,
      isConnected: !!state,
      connectedAt: state?.connectedAt ?? null,
      lastUsedAt: state?.lastUsedAt ?? null,
      activeScopes: state?.scopes ?? [],
    };
  });

  return NextResponse.json({ connections });
}

export async function DELETE(req: Request) {
  const session = await auth0.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { connection } = await req.json();
  if (!connection) {
    return NextResponse.json({ error: "Missing connection" }, { status: 400 });
  }

  const userId = session.user.sub;
  const revoked = await revokeConnection(userId, connection);

  if (!revoked) {
    return NextResponse.json({ error: "Connection not found or already revoked" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
