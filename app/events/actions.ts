"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EVENTS } from "@/lib/events";

export async function setActiveEvent(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !EVENTS.some((e) => e.id === id)) return;
  const store = await cookies();
  store.set("active_event", id, { path: "/", maxAge: 60 * 60 * 24 * 90 });
  revalidatePath("/", "layout");
  redirect("/");
}

export interface EventFormInput {
  id?: string; // present → edit
  name: string;
  admin: string;
  target: number;
  eventDate: string; // yyyy-mm-dd
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  campaignStart: string; // yyyy-mm-dd
  campaignDays: number;
}

export interface SaveEventResult {
  ok: boolean;
  error?: string;
}

/**
 * Create or edit an event.
 *
 * STUB: events are still config in `lib/events.ts`, so this only validates and
 * reports back. When the outreach API lands, replace the marked block with a
 * bearer-key POST/PATCH to `${OUTREACH_API}/api/outreach/events` and drop the
 * static array. Times are combined into ISO with the Lagos (+01:00) offset.
 */
export async function saveEvent(input: EventFormInput): Promise<SaveEventResult> {
  if (input.name.trim().length < 2) return { ok: false, error: "Event name is required." };
  if (input.admin.trim().length < 2) return { ok: false, error: "Admin name is required." };
  if (!Number.isFinite(input.target) || input.target < 1)
    return { ok: false, error: "Target must be a positive number." };
  if (!input.eventDate || !input.startTime || !input.endTime)
    return { ok: false, error: "Event date and times are required." };
  if (input.startTime >= input.endTime)
    return { ok: false, error: "End time must be after start time." };
  if (!input.campaignStart) return { ok: false, error: "Campaign start is required." };
  if (!Number.isFinite(input.campaignDays) || input.campaignDays < 1)
    return { ok: false, error: "Campaign length must be at least 1 day." };

  const eventStart = `${input.eventDate}T${input.startTime}:00+01:00`;
  const eventEnd = `${input.eventDate}T${input.endTime}:00+01:00`;

  // ── persistence (deferred to outreach API) ──────────────────────────────
  // const method = input.id ? "PATCH" : "POST";
  // await fetch(`${process.env.OUTREACH_API}/api/outreach/events`, {
  //   method,
  //   headers: { "content-type": "application/json", authorization: `Bearer ${process.env.OUTREACH_API_KEY}` },
  //   body: JSON.stringify({ ...input, eventStart, eventEnd }),
  // });
  void eventStart;
  void eventEnd;
  // ────────────────────────────────────────────────────────────────────────

  revalidatePath("/events");
  revalidatePath("/", "layout");
  return { ok: true };
}
