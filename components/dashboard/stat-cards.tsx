import {
  PhoneCall,
  MessageSquare,
  Users,
  PhoneOutgoing,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Stat {
  label: string;
  value: string;
  hint: string;
  icon: "reached" | "called" | "messaged" | "connect" | "followup";
  /** weekly series rendered as a mini bar sparkline */
  spark?: number[];
  /** hero card — solid royal blue */
  hero?: boolean;
  /** hint tone */
  trend?: "up" | "down";
}

const ICONS = {
  reached: Users,
  called: PhoneCall,
  messaged: MessageSquare,
  connect: PhoneOutgoing,
  followup: CalendarClock,
};

function Sparkline({ data, hero }: { data: number[]; hero?: boolean }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-8 items-end gap-1" aria-hidden>
      {data.map((v, i) => (
        <div
          key={i}
          className={cn(
            "w-1.5 rounded-full",
            hero ? "bg-white/45" : "bg-primary/25",
            i === data.length - 1 && (hero ? "bg-white" : "bg-primary")
          )}
          style={{ height: `${Math.max((v / max) * 100, 12)}%` }}
        />
      ))}
    </div>
  );
}

export function StatCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {stats.map((s) => {
        const Icon = ICONS[s.icon];
        return (
          <div
            key={s.label}
            className={cn(
              "card-soft rounded-3xl p-5",
              s.hero ? "bg-primary text-primary-foreground" : "bg-card"
            )}
          >
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl",
                  s.hero ? "bg-white/20" : "bg-accent text-accent-foreground"
                )}
              >
                <Icon className="size-4" />
              </span>
              {s.spark && <Sparkline data={s.spark} hero={s.hero} />}
            </div>
            <div className="mt-4 text-[1.65rem] leading-none font-bold tabular-nums">
              {s.value}
            </div>
            <p
              className={cn(
                "mt-1.5 text-xs font-medium",
                s.hero ? "text-white/75" : "text-muted-foreground",
                !s.hero && s.trend === "down" && "text-destructive",
                !s.hero && s.trend === "up" && "text-[var(--team-2)]"
              )}
            >
              {s.hint}
            </p>
            <p
              className={cn(
                "mt-2 text-[10px] font-bold tracking-widest uppercase",
                s.hero ? "text-white/60" : "text-muted-foreground/70"
              )}
            >
              {s.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
