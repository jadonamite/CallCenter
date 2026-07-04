"use client";

import { useState } from "react";
import { PhoneSolidIcon } from "@/components/icons/brand";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { LogCallDialog } from "./log-call-dialog";
import type { Contact } from "@/lib/types";

/**
 * Mobile call-queue card. The whole card is one big tap target that opens the
 * progressive call/WhatsApp dialog — built for a caller thumbing down the list.
 */
export function ContactCard({
  contact,
  origin,
  color,
  outcome,
  lastContact,
  eventName,
  inviteTemplate,
}: {
  contact: { id: string; name: string; phone: string; broughtBy: string };
  origin: string;
  color: string;
  outcome: Contact["outcome"];
  lastContact: string;
  eventName: string;
  inviteTemplate?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="card-soft bg-card active:bg-secondary/40 flex w-full items-center gap-3 rounded-2xl p-3.5 text-left transition-colors"
      >
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="truncate font-bold">{contact.name}</span>
            <StatusBadge outcome={outcome} />
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{
                background: `color-mix(in srgb, ${color} 13%, transparent)`,
                color,
              }}
            >
              {origin}
            </span>
            <span className="text-muted-foreground font-mono tabular-nums">
              {contact.phone}
            </span>
            <span className="text-muted-foreground/70">· {lastContact}</span>
          </div>
        </div>
        <span className="bg-primary text-primary-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
          <PhoneSolidIcon className="size-5" />
        </span>
      </button>

      <LogCallDialog
        open={open}
        onOpenChange={setOpen}
        contact={{ id: contact.id, name: contact.name, phone: contact.phone }}
        eventName={eventName}
        inviteTemplate={inviteTemplate}
      />
    </>
  );
}
