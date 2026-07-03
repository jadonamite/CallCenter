import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { GroupStats } from "@/lib/data";

const LEVEL_LABEL: Record<GroupStats["level"], string> = {
  TEAM: "Team",
  SENIOR_CELL: "Senior cell",
  CELL: "Cell",
};

interface Props {
  rows: GroupStats[];
  /** team id → css color; child rows inherit their team's hue */
  teamColorOf: Record<string, string>;
}

export function Leaderboard({ rows, teamColorOf }: Props) {
  const teams = rows.filter((r) => r.level === "TEAM");
  const ranked = [...teams].sort((a, b) => b.reached - a.reached);
  const rankOf = new Map(ranked.map((t, i) => [t.id, i + 1]));

  // regroup rows into team blocks and order the blocks by rank
  const blocks: GroupStats[][] = [];
  for (const r of rows) {
    if (r.depth === 0) blocks.push([r]);
    else blocks[blocks.length - 1]?.push(r);
  }
  blocks.sort((a, b) => (rankOf.get(a[0].id) ?? 99) - (rankOf.get(b[0].id) ?? 99));

  return (
    <div className="card-soft bg-card rounded-3xl p-6">
      <h2 className="text-base font-bold">Team standings</h2>
      <p className="text-muted-foreground mt-0.5 text-xs">
        Contacts collated per team, rolled up through senior cells and cells —
        every number traces back to the group that brought it
      </p>
      <div className="mt-4">
        <Table>
          <TableHeader>
            <TableRow className="border-none">
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Group</TableHead>
              <TableHead className="text-right">Collated</TableHead>
              <TableHead className="text-right">Reached</TableHead>
              <TableHead className="text-right">Called</TableHead>
              <TableHead className="text-right">Messaged</TableHead>
              <TableHead className="w-[190px]">Coverage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blocks.flatMap((block) => {
              const teamColor = teamColorOf[block[0].id];
              return block.map((r) => {
                const coverage = r.total ? Math.round((r.reached / r.total) * 100) : 0;
                const isTeam = r.level === "TEAM";
                return (
                  <TableRow
                    key={r.id}
                    className="border-border/60"
                    style={
                      isTeam
                        ? { background: `color-mix(in srgb, ${teamColor} 7%, transparent)` }
                        : undefined
                    }
                  >
                    <TableCell className="text-muted-foreground rounded-l-2xl font-bold tabular-nums">
                      {isTeam ? `#${rankOf.get(r.id)}` : ""}
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex items-center gap-2.5"
                        style={{ paddingLeft: `${r.depth * 20}px` }}
                      >
                        <span
                          className={cn(
                            "shrink-0 rounded-full",
                            isTeam ? "size-2.5" : "size-1.5 opacity-60"
                          )}
                          style={{ background: teamColor }}
                        />
                        <span className={cn(isTeam ? "font-bold" : "font-medium")}>
                          {r.name}
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase"
                          style={{
                            background: `color-mix(in srgb, ${teamColor} 14%, transparent)`,
                            color: teamColor,
                          }}
                        >
                          {LEVEL_LABEL[r.level]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold tabular-nums">
                      {r.total.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {r.reached.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right tabular-nums">
                      {r.called.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right tabular-nums">
                      {r.messaged.toLocaleString()}
                    </TableCell>
                    <TableCell className="rounded-r-2xl">
                      <div className="flex items-center gap-2">
                        <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${coverage}%`, background: teamColor }}
                          />
                        </div>
                        <span className="text-muted-foreground w-9 text-right text-xs font-semibold tabular-nums">
                          {coverage}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              });
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
