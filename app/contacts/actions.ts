"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { CallOutcome, Channel, Disposition } from "@/lib/outreach";
import { CALL_OUTCOMES } from "@/lib/outreach";

export interface LogOutcomeInput {
  contactId: string;
  outcome: CallOutcome;
  disposition?: Disposition;
  callBackAt?: string; // ISO date, only for call_back_later
  note?: string;
}

export interface LogOutcomeResult {
  ok: boolean;
  error?: string;
}

/**
 * Record a single call/message attempt against a contact.
 *
 * STUB: persistence is deferred to the outreach API. When it lands, replace the
 * marked block with a bearer-key POST to `${OUTREACH_API}/api/outreach/logs`
 * (server derives status + next follow-up from the accumulated logs). The
 * caller id is carried automatically from the per-device cookie set at PIN entry.
 */
export async function logOutcome(input: LogOutcomeInput): Promise<LogOutcomeResult> {
  const meta = CALL_OUTCOMES[input.outcome];
  if (!meta) return { ok: false, error: "Unknown outcome." };

  // a disposition only makes sense when the person was actually reached
  if (input.disposition && !meta.reached) {
    return { ok: false, error: "Disposition only applies when the contact was reached." };
  }
  if (input.disposition === "call_back_later" && !input.callBackAt) {
    return { ok: false, error: "Pick the call-back date." };
  }

  const store = await cookies();
  const callerId = store.get("caller_id")?.value ?? "unassigned";
  const channel: Channel = meta.channel;

  // ── persistence (deferred to outreach API) ──────────────────────────────
  // await fetch(`${process.env.OUTREACH_API}/api/outreach/logs`, {
  //   method: "POST",
  //   headers: { "content-type": "application/json", authorization: `Bearer ${process.env.OUTREACH_API_KEY}` },
  //   body: JSON.stringify({ ...input, callerId, channel, at: new Date().toISOString() }),
  // });
  void callerId;
  void channel;
  // ────────────────────────────────────────────────────────────────────────

  revalidatePath("/contacts");
  revalidatePath("/follow-ups");
  revalidatePath("/");
  return { ok: true };
}
