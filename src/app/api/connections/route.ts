import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

// Static connection definitions -- what ScopeGuard can connect to.
// Actual token state comes from Auth0 Token Vault at runtime.
const CONNECTIONS = [
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

  return NextResponse.json({ connections: CONNECTIONS });
}
