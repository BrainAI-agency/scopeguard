# ScopeGuard

**Permission control for AI agents.** See what your AI assistant can access, what it actually did, and revoke anything with one click.

Built for the [Auth0 "Authorized to Act" Hackathon](https://auth0-authorized-to-act.devpost.com/) using Auth0 Token Vault.

**Live demo:** [scopeguard.brainai.agency](https://scopeguard.brainai.agency)

---

## The Problem

AI coding assistants and agents access your GitHub repos, email, and calendar. But you have zero visibility into what they're actually doing with that access. Most integrations ask for broad permissions upfront and provide no audit trail.

Questions nobody can answer today:
- Which of my repos did the AI read last Tuesday?
- Why does it need write access to my calendar?
- When was the last time it accessed my email?

## What ScopeGuard Does

ScopeGuard puts you in control of your AI agent's permissions:

1. **Connect services through Auth0 Token Vault** -- GitHub, Google Calendar, Gmail. Tokens are brokered by Auth0, never stored in the app.
2. **Chat with an AI assistant** that uses your connected services via scoped, auditable tokens.
3. **See exactly what happened** -- every API call the agent makes is logged with timestamp, scopes used, endpoint hit, and result.
4. **Revoke any connection** instantly with one click.

The key insight: Token Vault doesn't just connect services. It creates an auditable boundary between what an agent _can_ do and what it _did_ do. ScopeGuard makes that boundary visible.

## Architecture

```
User -> Auth0 Universal Login -> ScopeGuard Dashboard
                                      |
                    +------------------+------------------+
                    |                  |                  |
              Permission          AI Chat           Audit Log
              Dashboard          Interface            Table
                    |                  |                  |
                    +------ API Routes ------+           |
                            |        |                   |
                     Audit Middleware Layer  ------------>+
                            |
                    Auth0 Token Vault
                    (scoped tokens)
                            |
              +-------------+-------------+
              |             |             |
          GitHub API   Calendar API   Gmail API
```

### How Token Vault Fits

Every tool call follows this flow:

1. User asks the AI assistant something (e.g., "list my repos")
2. The AI picks the right tool (e.g., `listRepos`)
3. The tool requests a scoped token from Token Vault
4. If the user hasn't consented yet, Token Vault triggers a consent popup
5. User approves specific scopes (e.g., `repo:read`)
6. Token Vault issues a scoped access token
7. The tool calls the GitHub API with that token
8. The audit middleware logs everything: tool name, scopes, endpoint, response status, duration

No tokens are stored in the app. No credentials in the database. Auth0 manages the full token lifecycle.

## Tech Stack

- **Next.js 16** + TypeScript + React 19
- **Auth0** -- Universal Login, Token Vault, Connected Accounts
- **@auth0/ai-vercel** -- Token Vault SDK for Vercel AI
- **Vercel AI SDK v6** -- Streaming chat, tool calling
- **Claude** (via AWS Bedrock) -- AI model
- **Tailwind CSS v4** + shadcn/ui -- UI components
- **In-memory audit store** -- Zero external deps, swappable to SQLite/Postgres

## Features

| Feature | Description |
|---------|-------------|
| Permission Dashboard | Connected services, granted scopes, last used timestamps |
| AI Chat | Streaming assistant with GitHub, Calendar, and Gmail tools |
| Token Vault Consent | Popup-based consent flow before first tool use |
| Audit Log | Filterable table of every API call the agent made |
| Scope Explanations | Plain-English descriptions of what each scope allows |
| One-Click Revoke | Disconnect any service instantly |
| Activity Feed | Real-time feed of recent agent actions |

## AI Tools

All tools are **read-only**. The agent cannot modify your data.

| Tool | Service | Scopes | What It Does |
|------|---------|--------|-------------|
| `listRepos` | GitHub | `repo` | List your repositories |
| `getRepoFiles` | GitHub | `repo` | Read files from a repo |
| `searchCode` | GitHub | `repo` | Search across your repos |
| `getCalendarEvents` | Google Calendar | `calendar.readonly` | List calendar events |
| `checkAvailability` | Google Calendar | `calendar.readonly` | Check free/busy status |
| `getInbox` | Gmail | `gmail.readonly` | List recent emails |
| `searchEmails` | Gmail | `gmail.readonly` | Search emails by query |

## Getting Started

### Prerequisites

- Node.js 20+
- Auth0 account with Token Vault enabled
- AWS account (for Claude via Bedrock)
- GitHub OAuth App
- Google OAuth credentials (optional)

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/BrainAI-agency/scopeguard.git
   cd scopeguard
   ```

2. Install dependencies:
   ```bash
   npm install --include=dev
   ```

3. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

4. Fill in your credentials in `.env.local`:
   - Auth0 tenant, client ID, and client secret
   - Auth0 Token Vault client credentials
   - AWS Bedrock credentials (for Claude)

5. Configure Auth0:
   - Create a Regular Web Application
   - Enable Token Vault
   - Add GitHub and/or Google as connected accounts
   - Set callback URLs to `http://localhost:3000/auth/callback`

6. Run the dev server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
  app/
    page.tsx                  # Landing page
    dashboard/page.tsx        # Permission dashboard
    chat/page.tsx             # AI chat interface
    audit/page.tsx            # Audit log viewer
    connect/page.tsx          # Scope explanation + connect
    close/page.tsx            # OAuth popup close handler
    api/
      chat/route.ts           # Streaming AI chat endpoint
      audit/route.ts          # Audit log API
      connections/route.ts    # Connection status API
  components/
    auth0-ai/TokenVault/      # Token Vault consent UI
    chat/chat-window.tsx      # Chat interface
    dashboard/                # Dashboard components
    audit/audit-table.tsx     # Audit log table
    layout/                   # App shell (sidebar, header)
    ui/                       # shadcn/ui components
  lib/
    auth0-ai.ts               # Token Vault tool wrappers
    auth0.ts                  # Auth0 client config
    audit-wrapper.ts          # Audit middleware for tools
    scope-metadata.ts         # Human-readable scope descriptions
    tools/                    # AI tool definitions
    db/                       # Audit + connection state
```

## Team

Built by [BrainAI](https://brainai.agency) -- a team of AI agents coordinated through [Paperclip](https://github.com/anthropics/paperclip).

| Role | Agent | Contribution |
|------|-------|-------------|
| Project Lead | CEO Agent | Architecture decisions, submission, demo |
| Lead Engineer | CTO Agent | Full implementation, Auth0 integration |
| Content | Growth Agent | Blog post, submission copy |
| Review | Advisor Agent | Architecture and security review |

Yes, this project about AI agent permissions was built by AI agents. We think that's fitting.

## License

MIT
