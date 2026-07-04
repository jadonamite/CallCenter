"use client";

import { useRef, useState } from "react";
import { Icon, Spinner } from "@/components/icons";
import { TeamDonut, type TeamSlice } from "@/components/dashboard/team-donut";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import type { GroupStats, OutcomeSlice } from "@/lib/data";

/**
 * Two one-tap PNG exports: the Collation-by-team donut on its own (big and
 * bold), and the team standings (teams + senior cells; cells collapsed). Each
 * report is rendered off-screen so it captures at a fixed, clean width
 * regardless of the viewport — only the trigger buttons are visible.
 */
export function CollationReport({
  eventName,
  dateLabel,
  teams,
  outcomes,
  rollup,
  teamColorOf,
}: {
  eventName: string;
  dateLabel: string;
  teams: TeamSlice[];
  outcomes: OutcomeSlice[];
  rollup: GroupStats[];
  teamColorOf: Record<string, string>;
}) {
  const collationRef = useRef<HTMLDivElement>(null);
  const standingsRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"collation" | "standings" | null>(null);

  const slug = eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  async function capture(
    which: "collation" | "standings",
    node: HTMLDivElement | null,
    suffix: string
  ) {
    if (!node || busy) return;
    setBusy(which);
    try {
      const { toPng } = await import("html-to-image");
      // Resolve the page background so the PNG isn't transparent.
      const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";
      const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true, backgroundColor: bg });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${slug}-${suffix}.png`;
      a.click();
    } catch {
      // Silent — the button re-enables so the caller can retry.
    } finally {
      setBusy(null);
    }
  }

  function Trigger({
    which,
    label,
    onClick,
  }: {
    which: "collation" | "standings";
    label: string;
    onClick: () => void;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={busy !== null}
        className="bg-secondary text-secondary-foreground hover:bg-secondary/70 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50"
      >
        {busy === which ? (
          <Spinner className="size-3.5 animate-spin" />
        ) : (
          <Icon name="download" className="size-3.5" />
        )}
        {busy === which ? "Preparing…" : label}
      </button>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Trigger
          which="collation"
          label="Collation"
          onClick={() => capture("collation", collationRef.current, "collation")}
        />
        <Trigger
          which="standings"
          label="Standings"
          onClick={() => capture("standings", standingsRef.current, "standings")}
        />
      </div>

      {/* Off-screen capture targets — laid out (not display:none) so recharts sizes. */}
      <div className="pointer-events-none fixed -left-[9999px] top-0" aria-hidden>
        {/* Collation — standalone, big and bold. */}
        <div ref={collationRef} className="bg-background w-[620px] space-y-4 p-8">
          <div>
            <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              Collation report
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight">{eventName}</h2>
            <p className="text-muted-foreground text-sm">Collation by team · {dateLabel}</p>
          </div>
          <TeamDonut teams={teams} outcomes={outcomes} />
        </div>

        {/* Standings — teams + senior cells, cells collapsed. */}
        <div ref={standingsRef} className="bg-background w-[820px] space-y-5 p-8">
          <div>
            <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              Team standings
            </p>
            <h2 className="text-2xl font-bold">{eventName}</h2>
            <p className="text-muted-foreground text-sm">{dateLabel}</p>
          </div>
          <Leaderboard
            rows={rollup}
            teamColorOf={teamColorOf}
            readOnly
            subtitle="Contacts collated per team, rolled up through senior cells"
          />
        </div>
      </div>
    </>
  );
}
