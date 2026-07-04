"use client";

import { useState, useTransition } from "react";
import { Icon, Spinner } from "@/components/icons";
import { createCaller, deleteCaller } from "@/app/caller/actions";

/**
 * Admin caller roster + registration. Callers sign in on their device with the
 * 4-digit PIN set here; every call log auto-carries their id.
 */
export function CallerManager({ callers }: { callers: { id: string; name: string }[] }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [pending, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function submit() {
    setMsg(null);
    startTransition(async () => {
      const res = await createCaller(name, pin);
      if (res.ok) {
        setMsg({ ok: true, text: `${name.trim()} registered.` });
        setName("");
        setPin("");
      } else {
        setMsg({ ok: false, text: res.error ?? "Could not register." });
      }
    });
  }

  function remove(id: string, callerName: string) {
    setMsg(null);
    setRemovingId(id);
    startTransition(async () => {
      const res = await deleteCaller(id);
      setRemovingId(null);
      if (res.ok) setMsg({ ok: true, text: `${callerName} removed.` });
      else setMsg({ ok: false, text: res.error ?? "Could not remove." });
    });
  }

  return (
    <div className="card-soft bg-card space-y-4 rounded-3xl p-5 sm:p-6">
      <div>
        <h2 className="text-base font-bold">Callers</h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Register the volunteers working the phones — each signs in once per device with their PIN
        </p>
      </div>

      {callers.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {callers.map((c) => (
            <li
              key={c.id}
              className="bg-secondary text-secondary-foreground flex items-center gap-1.5 rounded-full py-1.5 pr-1.5 pl-3 text-xs font-semibold"
            >
              {c.name}
              <button
                type="button"
                onClick={() => remove(c.id, c.name)}
                disabled={pending}
                aria-label={`Remove ${c.name}`}
                className="text-muted-foreground hover:bg-destructive hover:text-white flex size-5 items-center justify-center rounded-full transition-colors disabled:opacity-40"
              >
                {removingId === c.id ? (
                  <Spinner className="size-3" />
                ) : (
                  <Icon name="close" className="size-3" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-end gap-2.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          placeholder="Caller name"
          className="bg-secondary placeholder:text-muted-foreground focus:ring-ring h-10 min-w-40 flex-1 rounded-full px-4 text-sm font-medium outline-none focus:ring-2"
        />
        <input
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          maxLength={4}
          placeholder="4-digit PIN"
          className="bg-secondary placeholder:text-muted-foreground focus:ring-ring h-10 w-32 rounded-full px-4 text-center text-sm font-bold tracking-widest tabular-nums outline-none focus:ring-2"
        />
        <button
          type="button"
          onClick={submit}
          disabled={pending || name.trim().length < 2 || pin.length !== 4}
          className="bg-primary text-primary-foreground inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-xs font-bold disabled:opacity-40"
        >
          {pending ? <Spinner className="size-3.5 animate-spin" /> : <Icon name="user-plus" className="size-3.5" />}
          Register
        </button>
      </div>

      {msg && (
        <p
          className={`flex items-center gap-2 text-xs font-semibold ${
            msg.ok ? "text-[var(--team-2)]" : "text-destructive"
          }`}
        >
          {msg.ok ? <Icon name="success" className="size-4" /> : <Icon name="error" className="size-4" />}
          {msg.text}
        </p>
      )}
    </div>
  );
}
