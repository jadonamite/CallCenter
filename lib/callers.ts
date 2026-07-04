import { outreachWired } from "./outreach-api";

/**
 * Callers — the volunteers who work the phones. Admin-created (name + 4-digit
 * PIN); a caller enters their PIN once per device and every call log auto-carries
 * their id.
 *
 * The roster is served live from `GET /api/outreach/callers` when the outreach
 * API is wired; the array below is the seed / local-dev fallback (PINs here are
 * placeholders — real ones are scrypt-hashed server-side).
 */

export interface CallerRecord {
  id: string;
  name: string;
  /** STUB ONLY — real PINs are hashed server-side in e-register. */
  pin: string;
  active: boolean;
}

export const CALLERS: CallerRecord[] = [
  { id: "c-kanyin", name: "Sis. Kanyin", pin: "4304", active: true },
  { id: "c-amos", name: "Bro. Amos", pin: "9528", active: true },
  { id: "c-nifemi", name: "Sis. Nifemi", pin: "3483", active: true },
  { id: "c-emma", name: "Bro. Emma", pin: "5629", active: true },
];

export function findCaller(id: string | undefined): CallerRecord | undefined {
  return id ? CALLERS.find((c) => c.id === id) : undefined;
}

/**
 * Roster for the sign-in / manager pickers — id + name only, never the PIN.
 * Live from the API when wired, else the local stub. Server-only (reads secrets).
 */
export async function callerRoster(): Promise<{ id: string; name: string }[]> {
  if (outreachWired()) {
    try {
      const res = await fetch(`${process.env.OUTREACH_API}/api/outreach/callers`, {
        headers: { authorization: `Bearer ${process.env.OUTREACH_API_KEY}` },
        cache: "no-store",
      });
      if (res.ok) return (await res.json()) as { id: string; name: string }[];
    } catch {
      // fall through to the stub below
    }
  }
  return CALLERS.filter((c) => c.active).map(({ id, name }) => ({ id, name }));
}
