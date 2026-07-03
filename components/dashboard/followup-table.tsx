import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { dateOfDay, TODAY_INDEX } from "@/lib/data";
import type { Contact } from "@/lib/types";

interface Props {
  contacts: Contact[];
  /** group id → "Cell · Team" origin label */
  originOf: Record<string, string>;
  /** group id → its team's css color */
  colorOf: Record<string, string>;
}

const OUTCOME_BADGE: Record<
  Contact["outcome"],
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  answered: { label: "Answered", variant: "default" },
  no_answer: { label: "No answer", variant: "destructive" },
  messaged_only: { label: "Messaged", variant: "secondary" },
  not_contacted: { label: "Pending", variant: "outline" },
};

function fmt(day: number) {
  return dateOfDay(day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function FollowupTable({ contacts, originOf, colorOf }: Props) {
  const due = contacts
    .filter((c) => c.followUpDay !== null && c.followUpDay <= TODAY_INDEX + 3)
    .sort((a, b) => (a.followUpDay ?? 0) - (b.followUpDay ?? 0))
    .slice(0, 40);

  return (
    <div className="card-soft bg-card rounded-3xl p-6">
      <h2 className="text-base font-bold">Follow-up queue</h2>
      <p className="text-muted-foreground mt-0.5 text-xs">
        Due or overdue follow-ups, oldest first — {due.length} shown
      </p>
      <ScrollArea className="mt-4 h-[380px]">
        <Table>
          <TableHeader>
            <TableRow className="border-none">
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>From</TableHead>
              <TableHead>Brought by</TableHead>
              <TableHead>Last contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {due.map((c) => {
              const badge = OUTCOME_BADGE[c.outcome];
              const overdue = (c.followUpDay ?? 0) < TODAY_INDEX;
              const color = colorOf[c.groupId];
              return (
                <TableRow key={c.id} className="border-border/60">
                  <TableCell className="font-semibold">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs tabular-nums">
                    {c.phone}
                  </TableCell>
                  <TableCell>
                    <span
                      className="rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap"
                      style={{
                        background: `color-mix(in srgb, ${color} 13%, transparent)`,
                        color,
                      }}
                    >
                      {originOf[c.groupId] ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.broughtBy}
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {c.contactedDay !== null ? fmt(c.contactedDay) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className="rounded-full" variant={badge.variant}>
                      {badge.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className={overdue ? "text-destructive font-semibold" : ""}>
                      {c.followUpDay !== null ? fmt(c.followUpDay) : "—"}
                      {overdue && " · overdue"}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
