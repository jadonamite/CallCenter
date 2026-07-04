"use client";

import { useRef, useState } from "react";
import { Icon, Spinner } from "@/components/icons";
import { TeamDonut, type TeamSlice } from "@/components/dashboard/team-donut";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import type { GroupStats, OutcomeSlice } from "@/lib/data";

/**
 * A one-tap downloadable "collation report" — the Collation-by-team donut plus
 * the collapsed team standings, stitched into a single shareable PNG. The report
 * itself is rendered off-screen (so it captures at a fixed, clean width
 * regardless of the viewport) and only the trigger button is visible.
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
  const nodeRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function download() {
    const node = nodeRef.current;
    if (!node || busy) return;
    setBusy(true);
    try {
      const { toPng } = await import("html-to-image");
      // Resolve the page background so the PNG isn't transparent.
      const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";
      const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true, backgroundColor: bg });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `collation-${eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
      a.click();
    } catch {
      // Silent — the button re-enables so the caller can retry.
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="bg-secondary text-secondary-foreground hover:bg-secondary/70 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50"
      >
        {busy ? <Spinner className="size-3.5 animate-spin" /> : <Icon name="download" className="size-3.5" />}
        {busy ? "Preparing…" : "Download report"}
      </button>

      {/* Off-screen capture target — laid out (not display:none) so recharts sizes. */}
      <div className="pointer-events-none fixed -left-[9999px] top-0" aria-hidden>
        <div ref={nodeRef} className="bg-background w-[760px] space-y-5 p-6">
          <div>
            <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Collation report
            </p>
            <h2 className="text-2xl font-bold">{eventName}</h2>
            <p className="text-muted-foreground text-xs">{dateLabel}</p>
          </div>
          <TeamDonut teams={teams} outcomes={outcomes} />
          <Leaderboard
            rows={rollup}
            teamColorOf={teamColorOf}
            collapsedOnly
            subtitle="Contacts collated per team"
          />
        </div>
      </div>
    </>
  );
}
