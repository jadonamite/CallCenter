import { ThemeToggle } from "@/components/theme-toggle";

interface Props {
  week: number;
  totalWeeks: number;
  contacts: number;
  teams: number;
  target: number;
}

export function DashboardHeader({ week, totalWeeks, contacts, teams, target }: Props) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-[1.7rem] font-bold tracking-tight">
          Hello, Admin 👋
        </h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {contacts.toLocaleString()} contacts across {teams} teams · plan
          target {target.toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="glass-pill text-muted-foreground px-4 py-2 text-[11px] font-bold tracking-widest uppercase">
          Week {week} of {totalWeeks}
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
