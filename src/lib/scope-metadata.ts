/**
 * Plain-English descriptions of every OAuth scope we request.
 * Displayed on the /connect page before a user grants access.
 * This is ScopeGuard's transparency layer.
 */

export interface ScopeInfo {
  scope: string;
  name: string;
  description: string;
  canDo: string[];
  cannotDo: string[];
  risk: "low" | "medium" | "high";
}

export interface ConnectionInfo {
  id: string;
  name: string;
  icon: string;
  provider: string;
  color: string;
  scopes: ScopeInfo[];
}

export const connections: ConnectionInfo[] = [
  {
    id: "github",
    name: "GitHub",
    icon: "github",
    provider: "github",
    color: "#24292e",
    scopes: [
      {
        scope: "read:user",
        name: "Read Profile",
        description: "Access your GitHub username, avatar, and public profile information.",
        canDo: ["See your username and avatar", "Read your public profile bio"],
        cannotDo: ["Change your profile", "Access your email settings", "See your billing info"],
        risk: "low",
      },
      {
        scope: "repo",
        name: "Repository Access",
        description: "Read code, issues, and pull requests from your repositories.",
        canDo: [
          "List your repositories",
          "Read file contents",
          "Search across your code",
          "View issues and PRs",
        ],
        cannotDo: [
          "Push code or create commits",
          "Delete repositories",
          "Modify issues or PRs",
          "Change repository settings",
        ],
        risk: "medium",
      },
    ],
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    icon: "calendar",
    provider: "google-oauth2",
    color: "#4285f4",
    scopes: [
      {
        scope: "calendar.readonly",
        name: "Read Calendar",
        description: "View your calendar events, including times, titles, and attendees.",
        canDo: [
          "See your upcoming events",
          "Check your availability",
          "View event details and attendees",
        ],
        cannotDo: [
          "Create or edit events",
          "Delete events",
          "Respond to invitations",
          "Access other people's calendars",
        ],
        risk: "low",
      },
    ],
  },
  {
    id: "gmail",
    name: "Gmail",
    icon: "mail",
    provider: "google-oauth2",
    color: "#ea4335",
    scopes: [
      {
        scope: "gmail.readonly",
        name: "Read Email",
        description: "View your email messages, including sender, subject, and content.",
        canDo: [
          "Read your inbox",
          "Search emails by sender, subject, or content",
          "View email metadata (from, to, date)",
        ],
        cannotDo: [
          "Send emails",
          "Delete emails",
          "Modify labels or folders",
          "Access drafts",
        ],
        risk: "medium",
      },
    ],
  },
];

export function getConnectionById(id: string): ConnectionInfo | undefined {
  return connections.find((c) => c.id === id);
}

export function getOverallRisk(conn: ConnectionInfo): "low" | "medium" | "high" {
  if (conn.scopes.some((s) => s.risk === "high")) return "high";
  if (conn.scopes.some((s) => s.risk === "medium")) return "medium";
  return "low";
}
