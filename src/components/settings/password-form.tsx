"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { changePasswordAction } from "@/lib/actions/account";
import { RuledField } from "@/components/auth/ruled-field";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/types";

const initial: ActionState = { ok: false, error: "" };

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initial);

  useEffect(() => {
    if (state.ok) toast.success("Password changed.");
  }, [state]);

  const fieldErrors = !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={action} className="space-y-1" key={state.ok ? "done" : "form"}>
      <RuledField
        label="Current password"
        name="current"
        type="password"
        autoComplete="current-password"
        required
        errors={fieldErrors?.current}
      />
      <RuledField
        label="New password"
        name="next"
        type="password"
        autoComplete="new-password"
        required
        errors={fieldErrors?.next}
      />

      {!state.ok && state.error ? (
        <p className="text-destructive pt-2 text-sm" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" className="mt-4" disabled={pending}>
        {pending ? "Saving…" : "Change password"}
      </Button>
    </form>
  );
}
