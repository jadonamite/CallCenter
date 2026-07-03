"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { CALLERS } from "@/lib/callers";

const YEAR = 60 * 60 * 24 * 365;

export interface SetCallerResult {
  ok: boolean;
  name?: string;
  error?: string;
}

/**
 * Verify a caller's name + 4-digit PIN and remember them on this device.
 *
 * STUB: checks the local roster in `lib/callers.ts`. When the API lands, replace
 * with a POST to `${OUTREACH_API}/api/outreach/callers/verify` (scrypt compare
 * server-side); the cookie contract below stays the same.
 */
export async function setCaller(callerId: string, pin: string): Promise<SetCallerResult> {
  const caller = CALLERS.find((c) => c.id === callerId && c.active);
  if (!caller) return { ok: false, error: "Pick your name." };
  if (!/^\d{4}$/.test(pin)) return { ok: false, error: "Enter your 4-digit PIN." };
  if (caller.pin !== pin) return { ok: false, error: "Wrong PIN." };

  const store = await cookies();
  const opts = { path: "/", maxAge: YEAR, sameSite: "lax" as const };
  store.set("caller_id", caller.id, opts);
  store.set("caller_name", caller.name, opts);
  revalidatePath("/", "layout");
  return { ok: true, name: caller.name };
}

/** Forget the caller on this device (e.g. a shared phone changing hands). */
export async function clearCaller() {
  const store = await cookies();
  store.delete("caller_id");
  store.delete("caller_name");
  revalidatePath("/", "layout");
}
