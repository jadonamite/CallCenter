/**
 * Callers — the volunteers who work the phones. Admin-created (name + 4-digit
 * PIN); a caller enters their PIN once per device and every log auto-carries
 * their id.
 *
 * Until the outreach API lands, the roster + PINs live here as a stub (mirrors
 * `lib/events.ts`). When it lands: the roster comes from
 * `GET /api/outreach/callers`, and PIN verification moves server-side against
 * the scrypt hash (never ship real PINs to the client — these are placeholders).
 */

export interface CallerRecord {
  id: string;
  name: string;
  /** STUB ONLY — real PINs are hashed server-side in e-register. */
  pin: string;
  active: boolean;
}

export const CALLERS: CallerRecord[] = [
  { id: "c-tola", name: "Sis. Tola", pin: "1234", active: true },
  { id: "c-kelechi", name: "Bro. Kelechi", pin: "2468", active: true },
  { id: "c-amina", name: "Sis. Amina", pin: "1379", active: true },
  { id: "c-femi", name: "Bro. Femi", pin: "8642", active: true },
];

export function findCaller(id: string | undefined): CallerRecord | undefined {
  return id ? CALLERS.find((c) => c.id === id) : undefined;
}

/** Roster for the sign-in picker — id + name only, never the PIN. */
export function callerRoster(): { id: string; name: string }[] {
  return CALLERS.filter((c) => c.active).map(({ id, name }) => ({ id, name }));
}
