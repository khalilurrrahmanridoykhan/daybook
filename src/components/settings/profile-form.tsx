"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateProfileAction } from "@/lib/actions/account";
import { RuledField } from "@/components/auth/ruled-field";
import { SelectLine } from "@/components/settings/select-line";
import { Button } from "@/components/ui/button";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import type { ActionState } from "@/lib/actions/types";

const initial: ActionState = { ok: false, error: "" };

export function ProfileForm({
  name,
  timezone,
  currency,
  timezones,
}: {
  name: string | null;
  timezone: string;
  currency: string;
  timezones: string[];
}) {
  const [state, action, pending] = useActionState(updateProfileAction, initial);

  useEffect(() => {
    if (state.ok) toast.success("Your particulars are saved.");
  }, [state]);

  const fieldErrors = !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={action} className="space-y-1">
      <RuledField
        label="Name"
        name="name"
        defaultValue={name ?? ""}
        required
        errors={fieldErrors?.name}
      />
      <SelectLine label="Timezone" name="timezone" defaultValue={timezone}>
        {timezones.map((tz) => (
          <option key={tz} value={tz}>
            {tz.replace(/_/g, " ")}
          </option>
        ))}
      </SelectLine>
      <SelectLine label="Currency" name="currency" defaultValue={currency}>
        {SUPPORTED_CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} — {c.label}
          </option>
        ))}
      </SelectLine>

      {!state.ok && state.error ? (
        <p className="text-destructive pt-2 text-sm" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" className="mt-4" disabled={pending}>
        {pending ? "Saving…" : "Save particulars"}
      </Button>
    </form>
  );
}
