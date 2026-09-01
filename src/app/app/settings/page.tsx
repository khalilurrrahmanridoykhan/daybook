import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/app/page-header";
import { PhaseStub } from "@/components/app/phase-stub";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <div>
      <PageHeader title="Settings" description="Your profile, connections and data." />
      <dl className="bg-card divide-y rounded-lg border text-sm">
        <div className="flex justify-between p-4">
          <dt className="text-muted-foreground">Name</dt>
          <dd>{user.name ?? "—"}</dd>
        </div>
        <div className="flex justify-between p-4">
          <dt className="text-muted-foreground">Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div className="flex justify-between p-4">
          <dt className="text-muted-foreground">Currency</dt>
          <dd>{user.currency}</dd>
        </div>
        <div className="flex justify-between p-4">
          <dt className="text-muted-foreground">Timezone</dt>
          <dd>{user.timezone}</dd>
        </div>
      </dl>
      <div className="mt-6">
        <PhaseStub phase="Phase 1 / 4 / 5">
          Editable profile, Google Calendar connection, notification preferences, data export and
          account deletion land here.
        </PhaseStub>
      </div>
    </div>
  );
}
