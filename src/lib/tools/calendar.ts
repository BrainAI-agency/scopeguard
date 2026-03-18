import { tool } from "ai";
import { z } from "zod/v3";
import { google } from "googleapis";
import { startOfDay, endOfDay, formatISO } from "date-fns";
import { TokenVaultError } from "@auth0/ai/interrupts";
import { getAccessToken, withGoogleConnection } from "../auth0-ai";
import { auditToolCall } from "../audit-wrapper";

const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
];

export const getEventsTool = withGoogleConnection(
  tool({
    description:
      "Get events from the user's Google Calendar for a specific date. Returns event titles, times, locations, and attendees.",
    inputSchema: z.object({
      date: z.coerce
        .date()
        .describe("The date to get events for (YYYY-MM-DD format)"),
    }),
    execute: async ({ date }) => {
      const start = Date.now();
      try {
        const accessToken = await getAccessToken();
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: "v3", auth });

        const response = await calendar.events.list({
          calendarId: "primary",
          timeMin: formatISO(startOfDay(date)),
          timeMax: formatISO(endOfDay(date)),
          singleEvents: true,
          orderBy: "startTime",
          maxResults: 50,
        });

        const events = response.data.items || [];

        const result = {
          date: formatISO(date, { representation: "date" }),
          eventsCount: events.length,
          events: events.map((event) => ({
            summary: event.summary || "No title",
            startTime: event.start?.dateTime || event.start?.date,
            endTime: event.end?.dateTime || event.end?.date,
            location: event.location || null,
            attendees:
              event.attendees?.map((a) => ({
                email: a.email,
                name: a.displayName,
                status: a.responseStatus,
              })) || [],
          })),
        };

        await auditToolCall({
          toolName: "getCalendarEvents",
          connection: "google-oauth2",
          scopes: CALENDAR_SCOPES,
          apiEndpoint: "GET /calendar/v3/calendars/primary/events",
          status: "success",
          durationMs: Date.now() - start,
        });

        return result;
      } catch (error: any) {
        await auditToolCall({
          toolName: "getCalendarEvents",
          connection: "google-oauth2",
          scopes: CALENDAR_SCOPES,
          apiEndpoint: "GET /calendar/v3/calendars/primary/events",
          status: "error",
          errorMessage: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - start,
        });
        if (error?.status === 401) {
          throw new TokenVaultError("Google Calendar token expired or revoked");
        }
        throw error;
      }
    },
  })
);

export const checkAvailabilityTool = withGoogleConnection(
  tool({
    description:
      "Check the user's availability on a specific date. Returns free/busy time slots.",
    inputSchema: z.object({
      date: z.coerce
        .date()
        .describe("The date to check availability for (YYYY-MM-DD format)"),
    }),
    execute: async ({ date }) => {
      const start = Date.now();
      try {
        const accessToken = await getAccessToken();
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: "v3", auth });

        const response = await calendar.freebusy.query({
          requestBody: {
            timeMin: formatISO(startOfDay(date)),
            timeMax: formatISO(endOfDay(date)),
            items: [{ id: "primary" }],
          },
        });

        const busy = response.data.calendars?.primary?.busy || [];

        const result = {
          date: formatISO(date, { representation: "date" }),
          busySlots: busy.map((slot) => ({
            start: slot.start,
            end: slot.end,
          })),
          isFreeAllDay: busy.length === 0,
        };

        await auditToolCall({
          toolName: "checkAvailability",
          connection: "google-oauth2",
          scopes: CALENDAR_SCOPES,
          apiEndpoint: "POST /calendar/v3/freeBusy",
          apiMethod: "POST",
          status: "success",
          durationMs: Date.now() - start,
        });

        return result;
      } catch (error: any) {
        await auditToolCall({
          toolName: "checkAvailability",
          connection: "google-oauth2",
          scopes: CALENDAR_SCOPES,
          apiEndpoint: "POST /calendar/v3/freeBusy",
          apiMethod: "POST",
          status: "error",
          errorMessage: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - start,
        });
        if (error?.status === 401) {
          throw new TokenVaultError("Google Calendar token expired or revoked");
        }
        throw error;
      }
    },
  })
);
