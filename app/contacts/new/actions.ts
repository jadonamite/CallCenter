"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LIVE_EVENT_ID } from "@/lib/events";

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
 * STUB: persistence is deferred to the e-register outreach API. When it lands,
 * replace the marked block with a bearer-key POST to
 * `${OUTREACH_API}/api/outreach/contacts` (phone-deduped per event server-side).
 * The validate → dedupe → count → revalidate shape stays.
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

  // ── persistence (deferred to outreach API) ──────────────────────────────
  // await fetch(`${process.env.OUTREACH_API}/api/outreach/contacts`, {
  //   method: "POST",
  //   headers: { "content-type": "application/json", authorization: `Bearer ${process.env.OUTREACH_API_KEY}` },
  //   body: JSON.stringify({ eventId, groupId, broughtBy: broughtBy.trim(), contacts: clean }),
  // });
  void eventId; // used once the API is wired
  // ────────────────────────────────────────────────────────────────────────

  revalidatePath("/contacts");
  revalidatePath("/");
  return { ok: true, saved: clean.length, skipped };
}
