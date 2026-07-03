import { cookies } from "next/headers";
import { PageHeader } from "@/components/shell/page-header";
import { ThemeSettings } from "@/components/settings/theme-settings";
import { EVENTS, LIVE_EVENT_ID } from "@/lib/events";
import { saveAdminName } from "./actions";

export const metadata = { title: "Settings · Outreach Call Center" };

export default async function SettingsPage() {
  const store = await cookies();
  const adminName = store.get("admin_name")?.value ?? "Admin";
  const activeId = store.get("active_event")?.value ?? LIVE_EVENT_ID;
  const activeEvent = EVENTS.find((e) => e.id === activeId) ?? EVENTS[0];

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
