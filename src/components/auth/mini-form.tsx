"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/types";

type AnyAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;
const initial: ActionState = { ok: false, error: "" };

/** A small single-purpose auth form (resend link, request reset, set password). */
export function MiniForm({
  action,
  submit,
  done,
  children,
}: {
  action: AnyAction;
  submit: string;
  done?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  if (state.ok && done) return <>{done}</>;

  return (
    <form action={formAction} className="space-y-1">
      {children}
      {!state.ok && state.error ? (
        <p className="text-destructive pt-2 text-sm" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="mt-4 w-full" disabled={pending}>
        {pending ? "Please wait…" : submit}
      </Button>
    </form>
  );
}
