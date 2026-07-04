"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { LogCallDialog } from "./log-call-dialog";
import { useCallerGate } from "@/components/caller/caller-gate";

/** Per-row "Log call" trigger + dialog. Lives client-side so the table stays a server component. */
export function ContactRowActions({
  contact,
  eventName,
  inviteTemplate,
}: {
  contact: { id: string; name: string; phone: string };
  eventName: string;
  inviteTemplate?: string;
}) {
  const [open, setOpen] = useState(false);
  const { requireCaller } = useCallerGate();
  return (
    <>
      <button
        type="button"
        onClick={() => {
          // Gate: must be signed in as a caller before logging a call.
          if (requireCaller()) setOpen(true);
        }}
        className="bg-secondary text-secondary-foreground hover:bg-secondary/70 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
      >
        <Icon name="call" className="size-3.5" /> Log
      </button>
      <LogCallDialog
        open={open}
        onOpenChange={setOpen}
        contact={contact}
        eventName={eventName}
        inviteTemplate={inviteTemplate}
      />
    </>
  );
}
