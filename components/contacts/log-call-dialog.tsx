"use client";

import { useState, useTransition } from "react";
import { Phone, MessageCircle, MessageSquare, Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CALL_OUTCOMES,
  DISPOSITIONS,
  type CallOutcome,
  type Disposition,
} from "@/lib/outreach";
import {
  DEFAULT_INVITE,
  fillInvite,
  telLink,
  waLink,
  smsLink,
} from "@/lib/contact-links";
import { logOutcome } from "@/app/contacts/actions";

const OUTCOME_ORDER: CallOutcome[] = [
  "answered",
  "messaged",
  "no_answer",
  "busy",
  "switched_off",
  "wrong_number",
];

const DISPOSITION_ORDER: Disposition[] = ["coming", "call_back_later", "not_coming"];

function Chip({
  active,
  onClick,
  children,
  tone = "default",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "default" | "good" | "bad";
}) {
  const activeCls =
    tone === "good"
      ? "bg-[var(--team-2)] text-white"
      : tone === "bad"
        ? "bg-destructive text-white"
        : "bg-primary text-primary-foreground";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
        active ? activeCls : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
      }`}
    >
      {children}
    </button>
  );
}

export function LogCallDialog({
  open,
  onOpenChange,
  contact,
  eventName,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  contact: { id: string; name: string; phone: string };
  eventName: string;
}) {
  const [outcome, setOutcome] = useState<CallOutcome | null>(null);
  const [disposition, setDisposition] = useState<Disposition | null>(null);
  const [callBackAt, setCallBackAt] = useState("");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<LogResult | null>(null);

  const invite = fillInvite(DEFAULT_INVITE, contact.name, eventName);
  const reached = outcome ? CALL_OUTCOMES[outcome].reached : false;
  const ready =
    !!outcome &&
    (!reached || !!disposition) &&
    (disposition !== "call_back_later" || !!callBackAt);

  function reset() {
    setOutcome(null);
    setDisposition(null);
    setCallBackAt("");
    setNote("");
    setResult(null);
  }

  function pickOutcome(o: CallOutcome) {
    setOutcome(o);
    if (!CALL_OUTCOMES[o].reached) setDisposition(null);
  }

  function save() {
    if (!ready || !outcome) return;
    setResult(null);
    startTransition(async () => {
      const res = await logOutcome({
        contactId: contact.id,
        outcome,
        disposition: reached ? disposition ?? undefined : undefined,
        callBackAt: disposition === "call_back_later" ? callBackAt : undefined,
        note: note.trim() || undefined,
      });
      setResult(res);
      if (res.ok) {
        setTimeout(() => {
          onOpenChange(false);
          reset();
        }, 700);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contact.name}</DialogTitle>
          <DialogDescription className="font-mono tabular-nums">
            {contact.phone}
          </DialogDescription>
        </DialogHeader>

        {/* tap-to-call */}
        <div className="grid grid-cols-3 gap-2">
          <a
            href={telLink(contact.phone)}
            className="bg-primary text-primary-foreground flex flex-col items-center gap-1 rounded-2xl py-3 text-[11px] font-bold"
          >
            <Phone className="size-4" /> Call
          </a>
          <a
            href={waLink(contact.phone, invite)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 rounded-2xl bg-[var(--team-2)] py-3 text-[11px] font-bold text-white"
          >
            <MessageCircle className="size-4" /> WhatsApp
          </a>
          <a
            href={smsLink(contact.phone, invite)}
            className="bg-secondary text-secondary-foreground flex flex-col items-center gap-1 rounded-2xl py-3 text-[11px] font-bold"
          >
            <MessageSquare className="size-4" /> SMS
          </a>
        </div>

        {/* outcome */}
        <div className="space-y-2">
          <p className="text-xs font-bold">What happened?</p>
          <div className="flex flex-wrap gap-2">
            {OUTCOME_ORDER.map((o) => (
              <Chip key={o} active={outcome === o} onClick={() => pickOutcome(o)}>
                {CALL_OUTCOMES[o].label}
              </Chip>
            ))}
          </div>
        </div>

        {/* disposition — only when reached */}
        {reached && (
          <div className="space-y-2">
            <p className="text-xs font-bold">Are they coming?</p>
            <div className="flex flex-wrap gap-2">
              {DISPOSITION_ORDER.map((d) => (
                <Chip
                  key={d}
                  active={disposition === d}
                  onClick={() => setDisposition(d)}
                  tone={d === "coming" ? "good" : d === "not_coming" ? "bad" : "default"}
                >
                  {DISPOSITIONS[d]}
                </Chip>
              ))}
            </div>
            {disposition === "call_back_later" && (
              <input
                type="date"
                value={callBackAt}
                onChange={(e) => setCallBackAt(e.target.value)}
                className="bg-secondary focus:ring-ring h-9 rounded-full px-4 text-sm font-medium outline-none focus:ring-2"
              />
            )}
          </div>
        )}

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Note (optional)"
          className="bg-secondary placeholder:text-muted-foreground/60 focus:ring-ring w-full resize-none rounded-2xl p-3 text-sm outline-none focus:ring-2"
        />

        <div className="flex items-center justify-between gap-3">
          {result?.ok ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--team-2)]">
              <CheckCircle2 className="size-4" /> Logged
            </span>
          ) : result?.error ? (
            <span className="text-destructive flex items-center gap-1.5 text-xs font-semibold">
              <XCircle className="size-4" /> {result.error}
            </span>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={save}
            disabled={!ready || pending}
            className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold disabled:opacity-40"
          >
            {pending && <Loader2 className="size-3.5 animate-spin" />}
            {pending ? "Saving…" : "Save log"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type LogResult = { ok: boolean; error?: string };
