import { cookies } from "next/headers";
import { PageHeader } from "@/components/shell/page-header";
import { ThemeSettings } from "@/components/settings/theme-settings";
import { CallerManager } from "@/components/settings/caller-manager";
import { EVENTS, LIVE_EVENT_ID } from "@/lib/events";
import { callerRoster } from "@/lib/callers";
import { DEFAULT_INVITE } from "@/lib/contact-links";
import { saveAdminName, saveInviteTemplate, clearAdminName } from "./actions";

export const metadata = { title: "Settings · Outreach Call Center" };

export default async function SettingsPage() {
  const store = await cookies();
  const adminName = store.get("admin_name")?.value ?? "Admin";
  const hasCustomAdmin = Boolean(store.get("admin_name")?.value);
  const activeId = store.get("active_event")?.value ?? LIVE_EVENT_ID;
  const activeEvent = EVENTS.find((e) => e.id === activeId) ?? EVENTS[0];
  const inviteTemplate = store.get("invite_template")?.value ?? DEFAULT_INVITE;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader title="Settings" subtitle="Call center preferences" />

      <div className="card-soft bg-card space-y-4 rounded-3xl p-5 sm:p-6">
        <div>
          <h2 className="text-base font-bold">Admin</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Shown in the dashboard greeting and on events you run
          </p>
        </div>
        <form action={saveAdminName} className="flex flex-wrap gap-2.5">
          <input
            name="name"
            defaultValue={adminName}
            maxLength={40}
            placeholder="Admin name"
            className="bg-secondary placeholder:text-muted-foreground focus:ring-ring h-10 flex-1 rounded-full px-4 text-sm font-medium outline-none focus:ring-2"
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground rounded-full px-5 text-xs font-bold"
          >
            Save
          </button>
          {hasCustomAdmin && (
            <button
              type="submit"
              formAction={clearAdminName}
              className="text-muted-foreground hover:bg-destructive hover:text-white rounded-full border border-border px-4 text-xs font-bold transition-colors"
            >
              Delete
            </button>
          )}
        </form>
      </div>

      <div className="card-soft bg-card space-y-4 rounded-3xl p-5 sm:p-6">
        <div>
          <h2 className="text-base font-bold">Invite message</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Sent via WhatsApp from the call dialog and seeded into the SMS composer.
            Tokens fill in per person:{" "}
            <code className="bg-secondary rounded px-1 py-0.5">{"{name}"}</code>{" "}
            <code className="bg-secondary rounded px-1 py-0.5">{"{event}"}</code>
          </p>
        </div>
        <form action={saveInviteTemplate} className="space-y-3">
          <textarea
            name="template"
            defaultValue={inviteTemplate}
            rows={4}
            maxLength={500}
            className="bg-secondary placeholder:text-muted-foreground focus:ring-ring w-full resize-y rounded-2xl p-4 text-sm outline-none focus:ring-2"
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground rounded-full px-5 py-2 text-xs font-bold"
          >
            Save invite
          </button>
        </form>
      </div>

      <div className="card-soft bg-card space-y-4 rounded-3xl p-5 sm:p-6">
        <div>
          <h2 className="text-base font-bold">Appearance</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Both modes are hand-tuned — pick your poison
          </p>
        </div>
        <ThemeSettings />
      </div>

      <CallerManager callers={await callerRoster()} />

      <div className="card-soft bg-card space-y-3 rounded-3xl p-5 sm:p-6">
        <h2 className="text-base font-bold">Data &amp; sync</h2>
        <dl className="space-y-2.5 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-muted-foreground">Groups source</dt>
            <dd className="font-mono text-xs">e-register-nine.vercel.app/api/groups</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Groups refresh</dt>
            <dd className="font-semibold">every 5 minutes</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Active event</dt>
            <dd className="font-semibold">{activeEvent.name}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Contacts &amp; outreach data</dt>
            <dd className="text-muted-foreground text-xs">
              simulated — persistence lands with the outreach API
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
