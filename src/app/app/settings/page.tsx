import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/app/page-header";
import { PhaseStub } from "@/components/app/phase-stub";
import { Sheet } from "@/components/ledger/sheet";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();

  const rows: [string, string][] = [
    ["Name", user.name ?? "—"],
    ["Email", user.email],
    ["Currency", user.currency],
    ["Timezone", user.timezone],
  ];

  return (
    <div>
      <PageHeader
        folio="The endpapers"
        title="Settings"
        description="Your particulars, connections and data."
      />

      <Sheet ruled className="max-w-lg py-5 pr-6">
        <span className="folio">On file</span>
        <dl className="mt-2">
          {rows.map(([k, v]) => (
            <div
              key={k}
              className="flex items-baseline justify-between gap-4 border-t py-3 first:border-t-0"
            >
              <dt className="folio">{k}</dt>
              <dd className="text-[0.98rem]">{v}</dd>
            </div>
          ))}
        </dl>
      </Sheet>

      <div className="mt-6">
        <PhaseStub phase="Phase 1 / 4 / 5">
          Editable particulars, the Google Calendar connection, notification preferences, a full
          data export and account closure are entered here.
        </PhaseStub>
      </div>
    </div>
  );
}
