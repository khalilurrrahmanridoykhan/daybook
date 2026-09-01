import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { featureFlags } from "@/lib/env";
import { PageHeader } from "@/components/app/page-header";
import { Sheet, SheetHead } from "@/components/ledger/sheet";
import { ProfileForm } from "@/components/settings/profile-form";
import { PasswordForm } from "@/components/settings/password-form";
import { DangerZone } from "@/components/settings/danger-zone";

export const metadata: Metadata = { title: "Settings" };

function timezoneList() {
  const list =
    typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
  return list.length ? list : ["Asia/Dhaka", "UTC"];
}

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        folio="The endpapers"
        title="Settings"
        description="Your particulars, sign-in and data."
      />

      <Sheet ruled className="py-5 pr-6">
        <SheetHead folio="Particulars" />
        <div className="mt-4">
          <ProfileForm
            name={user.name}
            timezone={user.timezone}
            currency={user.currency}
            timezones={timezoneList()}
          />
        </div>
      </Sheet>

      <Sheet ruled className="py-5 pr-6">
        <SheetHead
          folio="Sign in"
          aside={featureFlags.email ? "email verification on" : "email verification off"}
        />
        <div className="mt-4">
          <PasswordForm />
        </div>
      </Sheet>

      <Sheet ruled className="py-5 pr-6">
        <SheetHead folio="Data & privacy" />
        <div className="mt-2">
          <DangerZone />
        </div>
      </Sheet>
    </div>
  );
}
