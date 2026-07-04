"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LIVE_EVENT_ID } from "@/lib/events";
import { outreachWired, isObjectId, outreachFetch } from "@/lib/outreach-api";

export interface SaveContactsInput {
  groupId: string;
  broughtBy: string;
  contacts: { name: string; phone: string }[];
}

export interface SaveContactsResult {
  ok: boolean;
  saved: number;
  skipped: number;
  error?: string;
}

/** Server-side gate: same shape the parser enforces client-side, re-checked here. */
function normalize(name: string, phone: string): { name: string; phone: string } | null {
  const cleanName = name.trim();
  const cleanPhone = phone.replace(/\s/g, "").replace(/^\+234/, "0");
  if (cleanName.length < 2) return null;
  if (!/^0\d{10}$/.test(cleanPhone)) return null;
  return { name: cleanName, phone: cleanPhone };
}

/**
 * Bulk-insert a cell's collated list against the active event.
 *
 * When the outreach API is wired (env set) and the active event is a real
 * ObjectId, this POSTs to `/api/outreach/contacts` and trusts the server's
 * saved/skipped counts (it phone-dedupes per event too). Otherwise it stays on
 * the demo stub: validate → dedupe → count, persisting nothing.
 */
export async function saveContacts(input: SaveContactsInput): Promise<SaveContactsResult> {
  const { groupId, broughtBy } = input;
  if (!groupId || broughtBy.trim().length < 2) {
    return { ok: false, saved: 0, skipped: 0, error: "Pick a cell and enter the rep's name." };
  }

  // validate + dedupe by phone within this batch
  const seen = new Set<string>();
  const clean: { name: string; phone: string }[] = [];
  let skipped = 0;
  for (const row of input.contacts) {
    const n = normalize(row.name, row.phone);
    if (!n || seen.has(n.phone)) {
      skipped += 1;
      continue;
    }
    seen.add(n.phone);
    clean.push(n);
  }
  if (clean.length === 0) {
    return { ok: false, saved: 0, skipped, error: "No valid rows to save." };
  }

  const store = await cookies();
  const eventId = store.get("active_event")?.value ?? LIVE_EVENT_ID;

  // Live persistence — only for a real event id; demo ids stay on the stub.
  if (outreachWired() && isObjectId(eventId)) {
    try {
      const data = await outreachFetch("/api/outreach/contacts", {
        method: "POST",
        body: { eventId, groupId, broughtBy: broughtBy.trim(), contacts: clean },
      });
      revalidatePath("/contacts");
      revalidatePath("/");
      // The API re-dedupes against contacts already on the event; add its skips.
      return {
        ok: true,
        saved: Number(data.saved ?? 0),
        skipped: skipped + Number(data.skipped ?? 0),
      };
    } catch (e) {
      return { ok: false, saved: 0, skipped, error: (e as Error).message };
    }
  }

  // Demo stub: persist nothing, report the batch-local counts.
  revalidatePath("/contacts");
  revalidatePath("/");
  return { ok: true, saved: clean.length, skipped };
}
