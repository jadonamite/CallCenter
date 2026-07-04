"use client";

import { Icon } from "@/components/icons";
import { useCallerGate } from "./caller-gate";

/**
 * Caller identity strip. Reads the shared caller gate: shows who's signed in
 * (calls log under this name) or prompts to sign in. The actual PIN dialog lives
 * in CallerGateProvider so calling is gated on it everywhere on the page.
 */
export function CallerBar() {
  const { callerName, openSignIn, signOut } = useCallerGate();

  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon name="user" className="text-muted-foreground size-3.5" />
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
          onClick={openSignIn}
          className="text-primary font-semibold hover:underline"
        >
          Sign in as a caller to log calls
        </button>
      )}
    </div>
  );
}
