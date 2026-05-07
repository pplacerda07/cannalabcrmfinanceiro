import { google } from "googleapis";

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );
}

export function getCalendarClient() {
  const auth = getOAuthClient();
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN! });
  return google.calendar({ version: "v3", auth });
}

export interface CreateEventInput {
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  attendeeEmail?: string;
}

export async function createCalendarEvent(input: CreateEventInput) {
  const calendar = getCalendarClient();

  const { data } = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: input.summary,
      description: input.description,
      start: { dateTime: input.startDateTime, timeZone: "America/Sao_Paulo" },
      end: { dateTime: input.endDateTime, timeZone: "America/Sao_Paulo" },
      conferenceData: {
        createRequest: { requestId: `meet-${Date.now()}` },
      },
      reminders: {
        useDefault: false,
        overrides: [{ method: "popup", minutes: 10 }],
      },
      attendees: input.attendeeEmail ? [{ email: input.attendeeEmail }] : [],
    },
  });

  return data;
}

export async function deleteCalendarEvent(eventId: string) {
  const calendar = getCalendarClient();
  await calendar.events.delete({
    calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
    eventId,
  });
}

export function getAuthUrl() {
  const auth = getOAuthClient();
  return auth.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar"],
    prompt: "consent",
  });
}

export async function exchangeCodeForTokens(code: string) {
  const auth = getOAuthClient();
  const { tokens } = await auth.getToken(code);
  return tokens;
}
