import Link from "next/link";
import { Icon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

interface Props {
  adminName: string;
  eventName: string;
  week: number;
  totalWeeks: number;
  contacts: number;
  teams: number;
  target: number;
}

export function DashboardHeader({
  adminName,
  eventName,
  week,
  totalWeeks,
  contacts,
  teams,
  target,
}: Props) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-[1.7rem] font-bold tracking-tight">
          Hello, {adminName} 👋
        </h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {eventName} · {contacts.toLocaleString()} contacts across {teams}{" "}
          teams · target {target.toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="glass-pill text-muted-foreground px-4 py-2 text-[11px] font-bold tracking-widest uppercase">
          Week {week} of {totalWeeks}
        </span>
        <Link
          href="/settings"
          aria-label="Settings"
          className="glass-pill text-muted-foreground hover:text-foreground flex size-10 items-center justify-center transition-colors md:hidden"
        >
          <Icon name="settings" className="size-4.5" />
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
