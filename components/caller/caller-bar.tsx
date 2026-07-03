"use client";

import { useState, useTransition } from "react";
import { UserRound, Loader2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { setCaller, clearCaller } from "@/app/caller/actions";

/**
 * Per-device caller identity strip. Shows who's calling (logs auto-carry this
 * id) or prompts for name + 4-digit PIN. Once real data lands this hardens into
 * a gate; for now it identifies the logger.
 */
export function CallerBar({
  callerName,
  roster,
}: {
  callerName: string | null;
  roster: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [callerId, setCallerId] = useState("");
  const [pin, setPin] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await setCaller(callerId, pin);
      if (res.ok) {
        setOpen(false);
        setPin("");
        setCallerId("");
      } else {
        setError(res.error ?? "Could not sign in.");
      }
    });
  }

  function signOut() {
    startTransition(() => clearCaller());
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <UserRound className="text-muted-foreground size-3.5" />
      {callerName ? (
        <>
          <span className="text-muted-foreground">
            Calling as <b className="text-foreground">{callerName}</b>
          </span>
          <button
            type="button"
            onClick={signOut}
            className="text-primary font-semibold hover:underline"
          >
            switch
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-primary font-semibold hover:underline"
        >
          Identify yourself to log calls
        </button>
      )}

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) {
            setError(null);
            setPin("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Who's calling?</DialogTitle>
            <DialogDescription>
              Pick your name and enter your 4-digit PIN. We&apos;ll remember you on
              this device.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-2">
            {roster.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCallerId(c.id)}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                  callerId === c.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <input
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="• • • •"
            className="bg-secondary placeholder:text-muted-foreground/50 focus:ring-ring h-11 rounded-2xl text-center text-lg font-bold tracking-[0.5em] outline-none focus:ring-2"
          />

          <div className="flex items-center justify-between gap-3">
            {error ? (
              <span className="text-destructive flex items-center gap-1.5 font-semibold">
                <XCircle className="size-4" /> {error}
              </span>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={submit}
              disabled={!callerId || pin.length !== 4 || pending}
              className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold disabled:opacity-40"
            >
              {pending && <Loader2 className="size-3.5 animate-spin" />}
              {pending ? "Checking…" : "Confirm"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
