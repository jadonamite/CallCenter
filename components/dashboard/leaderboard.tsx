import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { GroupStats } from "@/lib/data";

const LEVEL_LABEL: Record<GroupStats["level"], string> = {
  TEAM: "Team",
  SENIOR_CELL: "Senior cell",
  CELL: "Cell",
};

export function Leaderboard({ rows }: { rows: GroupStats[] }) {
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
  const ordered = blocks.flat();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team standings</CardTitle>
        <CardDescription>
          Contacts collated per team, rolled up through senior cells and cells —
          every number traces back to the group that brought it
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Group</TableHead>
              <TableHead className="text-right">Collated</TableHead>
              <TableHead className="text-right">Reached</TableHead>
              <TableHead className="text-right">Called</TableHead>
              <TableHead className="text-right">Messaged</TableHead>
              <TableHead className="w-[180px]">Coverage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordered.map((r) => {
              const coverage = r.total ? Math.round((r.reached / r.total) * 100) : 0;
              const isTeam = r.level === "TEAM";
              return (
                <TableRow key={r.id} className={cn(isTeam && "bg-muted/40")}>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {isTeam ? `#${rankOf.get(r.id)}` : ""}
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center gap-2"
                      style={{ paddingLeft: `${r.depth * 20}px` }}
                    >
                      <span className={cn(isTeam ? "font-semibold" : "font-normal")}>
                        {r.name}
                      </span>
                      <Badge
                        variant={isTeam ? "default" : "outline"}
                        className="text-[10px]"
                      >
                        {LEVEL_LABEL[r.level]}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {r.total.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.reached.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right tabular-nums">
                    {r.called.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right tabular-nums">
                    {r.messaged.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={coverage} className="h-1.5" />
                      <span className="text-muted-foreground w-9 text-right text-xs tabular-nums">
                        {coverage}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
