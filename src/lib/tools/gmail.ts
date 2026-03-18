import { tool } from "ai";
import { z } from "zod/v3";
import { google } from "googleapis";
import { TokenVaultError } from "@auth0/ai/interrupts";
import { getAccessToken, withGmailConnection } from "../auth0-ai";
import { auditToolCall } from "../audit-wrapper";

const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

export const getInboxTool = withGmailConnection(
  tool({
    description:
      "Get recent emails from the user's Gmail inbox. Returns sender, subject, snippet, and date.",
    inputSchema: z.object({
      limit: z
        .number()
        .min(1)
        .max(20)
        .optional()
        .describe("Maximum number of emails to return (default 10)"),
    }),
    execute: async ({ limit }) => {
      const start = Date.now();
      try {
        const accessToken = await getAccessToken();
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const gmail = google.gmail({ version: "v1", auth });

        const listResponse = await gmail.users.messages.list({
          userId: "me",
          maxResults: limit ?? 10,
          labelIds: ["INBOX"],
        });

        const messages = listResponse.data.messages || [];

        const emails = await Promise.all(
          messages.map(async (msg) => {
            const detail = await gmail.users.messages.get({
              userId: "me",
              id: msg.id!,
              format: "metadata",
              metadataHeaders: ["From", "Subject", "Date"],
            });

            const headers = detail.data.payload?.headers || [];
            const getHeader = (name: string) =>
              headers.find((h) => h.name === name)?.value || "";

            return {
              id: msg.id,
              from: getHeader("From"),
              subject: getHeader("Subject"),
              date: getHeader("Date"),
              snippet: detail.data.snippet || "",
            };
          })
        );

        await auditToolCall({
          toolName: "getInbox",
          connection: "google-oauth2",
          scopes: GMAIL_SCOPES,
          apiEndpoint: "GET /gmail/v1/users/me/messages",
          status: "success",
          durationMs: Date.now() - start,
        });

        return { emails, totalCount: listResponse.data.resultSizeEstimate || 0 };
      } catch (error: any) {
        await auditToolCall({
          toolName: "getInbox",
          connection: "google-oauth2",
          scopes: GMAIL_SCOPES,
          apiEndpoint: "GET /gmail/v1/users/me/messages",
          status: "error",
          errorMessage: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - start,
        });
        if (error?.status === 401) {
          throw new TokenVaultError("Gmail token expired or revoked");
        }
        throw error;
      }
    },
  })
);

export const searchEmailsTool = withGmailConnection(
  tool({
    description:
      "Search the user's Gmail for emails matching a query. Supports Gmail search syntax.",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "Gmail search query (e.g., 'from:john subject:meeting', 'is:unread', 'after:2026/01/01')"
        ),
      limit: z
        .number()
        .min(1)
        .max(20)
        .optional()
        .describe("Maximum number of results (default 10)"),
    }),
    execute: async ({ query, limit }) => {
      const start = Date.now();
      try {
        const accessToken = await getAccessToken();
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const gmail = google.gmail({ version: "v1", auth });

        const listResponse = await gmail.users.messages.list({
          userId: "me",
          q: query,
          maxResults: limit ?? 10,
        });

        const messages = listResponse.data.messages || [];

        const emails = await Promise.all(
          messages.map(async (msg) => {
            const detail = await gmail.users.messages.get({
              userId: "me",
              id: msg.id!,
              format: "metadata",
              metadataHeaders: ["From", "Subject", "Date"],
            });

            const headers = detail.data.payload?.headers || [];
            const getHeader = (name: string) =>
              headers.find((h) => h.name === name)?.value || "";

            return {
              id: msg.id,
              from: getHeader("From"),
              subject: getHeader("Subject"),
              date: getHeader("Date"),
              snippet: detail.data.snippet || "",
            };
          })
        );

        await auditToolCall({
          toolName: "searchEmails",
          connection: "google-oauth2",
          scopes: GMAIL_SCOPES,
          apiEndpoint: "GET /gmail/v1/users/me/messages",
          status: "success",
          durationMs: Date.now() - start,
        });

        return { query, emails, totalResults: listResponse.data.resultSizeEstimate || 0 };
      } catch (error: any) {
        await auditToolCall({
          toolName: "searchEmails",
          connection: "google-oauth2",
          scopes: GMAIL_SCOPES,
          apiEndpoint: "GET /gmail/v1/users/me/messages",
          status: "error",
          errorMessage: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - start,
        });
        if (error?.status === 401) {
          throw new TokenVaultError("Gmail token expired or revoked");
        }
        throw error;
      }
    },
  })
);
