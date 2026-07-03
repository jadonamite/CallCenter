import { Card, CardContent } from "@/components/ui/card";
import {
  PhoneCall,
  MessageSquare,
  Users,
  PhoneMissed,
  CalendarClock,
} from "lucide-react";

export interface Stat {
  label: string;
  value: string;
  hint: string;
  icon: "reached" | "called" | "messaged" | "connect" | "followup";
}

const ICONS = {
  reached: Users,
  called: PhoneCall,
  messaged: MessageSquare,
  connect: PhoneMissed,
  followup: CalendarClock,
};

export function StatCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {stats.map((s) => {
        const Icon = ICONS[s.icon];
        return (
          <Card key={s.label} className="py-4">
            <CardContent className="px-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {s.label}
                </span>
                <Icon className="text-muted-foreground size-4" />
              </div>
              <div className="mt-2 text-2xl font-semibold tabular-nums">
                {s.value}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">{s.hint}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
