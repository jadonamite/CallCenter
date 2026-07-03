import { Separator } from "@/components/ui/separator";
import { StatCards, type Stat } from "@/components/dashboard/stat-cards";
import { OutreachChart } from "@/components/dashboard/outreach-chart";
import { OutcomeChart } from "@/components/dashboard/outcome-chart";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { FollowupTable } from "@/components/dashboard/followup-table";
import { ancestryMap, buildTree, getGroups } from "@/lib/groups";
import {
  dailySeries,
  generateContacts,
  groupRollup,
  outcomeBreakdown,
  paceSeries,
  PLAN_DAYS,
  PLAN_TARGET,
  TODAY_INDEX,
} from "@/lib/data";

export default async function DashboardPage() {
  const groups = await getGroups();
  const roots = buildTree(groups);
  const contacts = generateContacts(roots);

  const daily = dailySeries(contacts);
  const pace = paceSeries(daily);
  const rollup = groupRollup(groups, roots, contacts);
  const outcomes = outcomeBreakdown(contacts);

  const reached = contacts.filter((c) => c.contactedDay !== null);
  const called = reached.filter((c) => c.channel === "call");
  const answered = reached.filter((c) => c.outcome === "answered");
  const messagedNotCalled = reached.filter((c) => c.channel === "message");
  const followupsDue = contacts.filter(
    (c) => c.followUpDay !== null && c.followUpDay <= TODAY_INDEX
  );

  const week = Math.min(Math.floor(TODAY_INDEX / 7) + 1, 7);
  const targetToDate = Math.round(((TODAY_INDEX + 1) / PLAN_DAYS) * PLAN_TARGET);
  const paceDelta = reached.length - targetToDate;

  const stats: Stat[] = [
    {
      label: "People reached",
      value: reached.length.toLocaleString(),
      hint: `${paceDelta >= 0 ? "+" : ""}${paceDelta} vs plan target of ${targetToDate}`,
      icon: "reached",
    },
    {
      label: "Total called",
      value: called.length.toLocaleString(),
      hint: `${answered.length} answered`,
      icon: "called",
    },
    {
      label: "Messaged, not called",
      value: messagedNotCalled.length.toLocaleString(),
      hint: "reached by message only",
      icon: "messaged",
    },
    {
      label: "Connect rate",
      value: called.length
        ? `${Math.round((answered.length / called.length) * 100)}%`
        : "—",
      hint: "answered ÷ calls made",
      icon: "connect",
    },
    {
      label: "Follow-ups due",
      value: followupsDue.length.toLocaleString(),
      hint: "due today or overdue",
      icon: "followup",
    },
  ];

  // "Cell · Team" origin label for each group
  const ancestry = ancestryMap(groups);
  const originOf: Record<string, string> = {};
  for (const [id, chain] of ancestry) {
    const team = chain[chain.length - 1];
    originOf[id] =
      chain.length > 1 ? `${chain[0].name} · ${team.name}` : chain[0].name;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Outreach Call Center
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Follow-up &amp; data collation · Week {week} of 7 ·{" "}
            {contacts.length.toLocaleString()} contacts across {roots.length}{" "}
            teams
          </p>
        </div>
        <p className="text-muted-foreground text-sm tabular-nums">
          Plan target: {PLAN_TARGET.toLocaleString()} people
        </p>
      </header>

      <Separator />

      <StatCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OutreachChart daily={daily} pace={pace} planWeeks={7} />
        </div>
        <OutcomeChart slices={outcomes} />
      </div>

      <Leaderboard rows={rollup} />

      <FollowupTable contacts={contacts} originOf={originOf} />
    </div>
  );
}
