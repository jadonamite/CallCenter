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
import { ScrollArea } from "@/components/ui/scroll-area";
import { dateOfDay, TODAY_INDEX } from "@/lib/data";
import type { Contact } from "@/lib/types";

interface Props {
  contacts: Contact[];
  /** group id → "Cell · Team" origin label */
  originOf: Record<string, string>;
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

export function FollowupTable({ contacts, originOf }: Props) {
  const due = contacts
    .filter((c) => c.followUpDay !== null && c.followUpDay <= TODAY_INDEX + 3)
    .sort((a, b) => (a.followUpDay ?? 0) - (b.followUpDay ?? 0))
    .slice(0, 40);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Follow-up queue</CardTitle>
        <CardDescription>
          Due or overdue follow-ups, oldest first — {due.length} shown
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[380px]">
          <Table>
            <TableHeader>
              <TableRow>
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
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {c.phone}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {originOf[c.groupId] ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.broughtBy}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {c.contactedDay !== null ? fmt(c.contactedDay) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className={overdue ? "text-destructive font-medium" : ""}>
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
      </CardContent>
    </Card>
  );
}
