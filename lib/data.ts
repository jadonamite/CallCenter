import { ApiGroup, Contact, ContactOutcome, GroupNode } from "./types";
import { ancestryMap, leafNodes } from "./groups";

/** 2-week outreach sprint ahead of the event */
export const PLAN_START = new Date("2026-06-29T00:00:00Z"); // Monday, week 1
export const PLAN_DAYS = 14;
export const PLAN_WEEKS = PLAN_DAYS / 7;
export const PLAN_TARGET = 560; // people to reach by event day
export const TODAY_INDEX = dayIndexOf(new Date("2026-07-03T00:00:00Z"));

export function dayIndexOf(date: Date): number {
  return Math.floor((date.getTime() - PLAN_START.getTime()) / 86_400_000);
}

export function dateOfDay(day: number): Date {
  return new Date(PLAN_START.getTime() + day * 86_400_000);
}

/* Deterministic PRNG so server and client render identical data */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  "Chinedu", "Amara", "Tunde", "Ngozi", "Emeka", "Funke", "Ibrahim", "Blessing",
  "Segun", "Chioma", "Musa", "Adaeze", "Kunle", "Halima", "Obinna", "Yetunde",
  "David", "Grace", "Samuel", "Esther", "Daniel", "Mercy", "Joshua", "Faith",
  "Peter", "Joy", "Michael", "Peace", "Victor", "Gloria", "Emmanuel", "Ruth",
];
const LAST_NAMES = [
  "Okafor", "Adeyemi", "Bello", "Eze", "Olawale", "Nwosu", "Abubakar", "Ojo",
  "Chukwu", "Adebayo", "Ibe", "Lawal", "Umeh", "Afolabi", "Okoro", "Balogun",
  "Ogunleye", "Nnamdi", "Salami", "Uche", "Akande", "Obi", "Yusuf", "Igwe",
];
const AGENTS = [
  "Sis. Tola", "Bro. Kelechi", "Sis. Amina", "Bro. Femi", "Sis. Chidera",
  "Bro. Sola", "Sis. Nneka", "Bro. Tobi", "Sis. Rachael", "Bro. Uche",
];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(h, 31) + id.charCodeAt(i)) | 0;
  return h;
}

/** Weekday-weighted probability a contact attempt lands on a given plan day. */
function dayWeight(day: number, rand: () => number): number {
  const weekday = dateOfDay(day).getUTCDay();
  const base = weekday === 0 ? 0.4 : weekday === 6 ? 1.4 : 1.0; // Sat push, Sun quiet
  return base * (0.7 + rand() * 0.6);
}

export function generateContacts(roots: GroupNode[]): Contact[] {
  const leaves = leafNodes(roots);
  const contacts: Contact[] = [];

  for (const leaf of leaves) {
    const rand = mulberry32(hashId(leaf._id));
    const size = 28 + Math.floor(rand() * 32); // 28–59 contacts per cell

    for (let i = 0; i < size; i++) {
      const name = `${FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]} ${
        LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]}`;
      const phone = `080${Math.floor(10000000 + rand() * 89999999)}`;
      const broughtBy = AGENTS[Math.floor(rand() * AGENTS.length)];

      // ~78% of contacts have been attempted so far
      const attempted = rand() < 0.78;
      let contactedDay: number | null = null;
      if (attempted) {
        // pick a day weighted toward weekdays, within elapsed plan days
        let best = 0;
        let bestW = -1;
        for (let d = 0; d <= TODAY_INDEX; d++) {
          const w = dayWeight(d, rand) * rand();
          if (w > bestW) {
            bestW = w;
            best = d;
          }
        }
        contactedDay = best;
      }

      let outcome: ContactOutcome = "not_contacted";
      let channel: Contact["channel"] = null;
      let attempts = 0;
      let followUpDay: number | null = null;

      if (contactedDay !== null) {
        const r = rand();
        if (r < 0.48) {
          outcome = "answered";
          channel = "call";
        } else if (r < 0.74) {
          outcome = "no_answer";
          channel = "call";
        } else {
          outcome = "messaged_only";
          channel = "message";
        }
        attempts = 1 + Math.floor(rand() * 3);
        if (outcome !== "answered") {
          followUpDay = contactedDay + 2 + Math.floor(rand() * 6);
        } else if (rand() < 0.3) {
          followUpDay = contactedDay + 5 + Math.floor(rand() * 9);
        }
      }

      contacts.push({
        id: `${leaf._id}-${i}`,
        name,
        phone,
        groupId: leaf._id,
        broughtBy,
        contactedDay,
        channel,
        outcome,
        attempts,
        followUpDay,
      });
    }
  }
  return contacts;
}

/* ---------- aggregations ---------- */

export interface DailyPoint {
  day: number;
  date: string;
  label: string;
  week: number;
  called: number;
  messaged: number;
}

export function dailySeries(contacts: Contact[]): DailyPoint[] {
  const points: DailyPoint[] = Array.from({ length: TODAY_INDEX + 1 }, (_, d) => {
    const date = dateOfDay(d);
    return {
      day: d,
      date: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
      week: Math.floor(d / 7) + 1,
      called: 0,
      messaged: 0,
    };
  });
  for (const c of contacts) {
    if (c.contactedDay === null) continue;
    const p = points[c.contactedDay];
    if (!p) continue;
    if (c.channel === "call") p.called += 1;
    else p.messaged += 1;
  }
  return points;
}

export interface PacePoint {
  day: number;
  label: string;
  actual: number | null;
  target: number;
}

export function paceSeries(daily: DailyPoint[]): PacePoint[] {
  let cum = 0;
  const actualByDay = new Map(daily.map((p) => [p.day, p.called + p.messaged]));
  return Array.from({ length: PLAN_DAYS }, (_, d) => {
    const date = dateOfDay(d);
    if (d <= TODAY_INDEX) cum += actualByDay.get(d) ?? 0;
    return {
      day: d,
      label: date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
      actual: d <= TODAY_INDEX ? cum : null,
      target: Math.round(((d + 1) / PLAN_DAYS) * PLAN_TARGET),
    };
  });
}

export interface GroupStats {
  id: string;
  name: string;
  level: ApiGroup["level"];
  depth: number;
  total: number;
  reached: number;
  called: number;
  messaged: number;
}

/** Roll contact counts up the hierarchy; returns rows in tree order (team → senior cell → cell). */
export function groupRollup(
  groups: ApiGroup[],
  roots: GroupNode[],
  contacts: Contact[]
): GroupStats[] {
  const ancestry = ancestryMap(groups);
  const stats = new Map<string, GroupStats>();
  const ensure = (g: ApiGroup, depth: number) => {
    if (!stats.has(g._id)) {
      stats.set(g._id, {
        id: g._id, name: g.name, level: g.level, depth,
        total: 0, reached: 0, called: 0, messaged: 0,
      });
    }
    return stats.get(g._id)!;
  };

  // register everything in tree order so output is hierarchical
  const rows: GroupStats[] = [];
  const walk = (n: GroupNode, depth: number) => {
    rows.push(ensure(n, depth));
    n.children.forEach((c) => walk(c, depth + 1));
  };
  roots.forEach((r) => walk(r, 0));

  for (const c of contacts) {
    const chain = ancestry.get(c.groupId) ?? [];
    for (const g of chain) {
      const s = stats.get(g._id);
      if (!s) continue;
      s.total += 1;
      if (c.contactedDay !== null) {
        s.reached += 1;
        if (c.channel === "call") s.called += 1;
        else s.messaged += 1;
      }
    }
  }
  return rows;
}

/** all follow-ups due within 3 days (or overdue), oldest first */
export function dueFollowups(contacts: Contact[]): Contact[] {
  return contacts
    .filter((c) => c.followUpDay !== null && c.followUpDay <= TODAY_INDEX + 3)
    .sort((a, b) => (a.followUpDay ?? 0) - (b.followUpDay ?? 0));
}

export interface OutcomeSlice {
  outcome: ContactOutcome;
  label: string;
  count: number;
}

export function outcomeBreakdown(contacts: Contact[]): OutcomeSlice[] {
  const labels: Record<ContactOutcome, string> = {
    answered: "Answered",
    no_answer: "No answer",
    messaged_only: "Messaged only",
    not_contacted: "Not yet contacted",
  };
  const counts = new Map<ContactOutcome, number>();
  for (const c of contacts) counts.set(c.outcome, (counts.get(c.outcome) ?? 0) + 1);
  return (Object.keys(labels) as ContactOutcome[]).map((o) => ({
    outcome: o,
    label: labels[o],
    count: counts.get(o) ?? 0,
  }));
}
