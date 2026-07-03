import { DashboardHeader } from "@/components/dashboard/header";
import { StatCards, type Stat } from "@/components/dashboard/stat-cards";
import { OutreachChart } from "@/components/dashboard/outreach-chart";
import { TeamDonut, type TeamSlice } from "@/components/dashboard/team-donut";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { FollowupTable } from "@/components/dashboard/followup-table";
import { ancestryMap, buildTree, getGroups } from "@/lib/groups";
import { teamColorMap } from "@/lib/team-colors";
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
  const teamColorOf = teamColorMap(groups);

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

  // weekly sparklines
  const weeks = Array.from({ length: week }, (_, i) =>
    daily.filter((d) => d.week === i + 1)
  );
  const sparkReached = weeks.map((w) => w.reduce((n, d) => n + d.called + d.messaged, 0));
  const sparkCalled = weeks.map((w) => w.reduce((n, d) => n + d.called, 0));
  const sparkMessaged = weeks.map((w) => w.reduce((n, d) => n + d.messaged, 0));

  const stats: Stat[] = [
    {
      label: "People reached",
      value: reached.length.toLocaleString(),
      hint: `${paceDelta >= 0 ? "+" : ""}${paceDelta} vs plan target of ${targetToDate}`,
      icon: "reached",
      spark: sparkReached,
      hero: true,
    },
    {
      label: "Total called",
      value: called.length.toLocaleString(),
      hint: `${answered.length} answered`,
      icon: "called",
      spark: sparkCalled,
    },
    {
      label: "Messaged, not called",
      value: messagedNotCalled.length.toLocaleString(),
      hint: "reached by message only",
      icon: "messaged",
      spark: sparkMessaged,
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
      trend: "down",
    },
  ];

  // group id → origin label and team color
  const ancestry = ancestryMap(groups);
  const originOf: Record<string, string> = {};
  const colorOf: Record<string, string> = {};
  for (const [id, chain] of ancestry) {
    const team = chain[chain.length - 1];
    originOf[id] =
      chain.length > 1 ? `${chain[0].name} · ${team.name}` : chain[0].name;
    colorOf[id] = teamColorOf[team._id];
  }

  const teamSlices: TeamSlice[] = rollup
    .filter((r) => r.level === "TEAM")
    .sort((a, b) => b.total - a.total)
    .map((t) => ({ id: t.id, name: t.name, total: t.total, color: teamColorOf[t.id] }));

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-6 py-8">
      <DashboardHeader
        week={week}
        contacts={contacts.length}
        teams={roots.length}
        target={PLAN_TARGET}
      />

      <StatCards stats={stats} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OutreachChart daily={daily} pace={pace} planWeeks={7} />
        </div>
        <TeamDonut teams={teamSlices} outcomes={outcomes} />
      </div>

      <Leaderboard rows={rollup} teamColorOf={teamColorOf} />

      <FollowupTable contacts={contacts} originOf={originOf} colorOf={colorOf} />
    </div>
  );
}
