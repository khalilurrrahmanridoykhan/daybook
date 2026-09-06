"use client";

import { useActionState } from "react";
import { setAllocationAction } from "@/lib/actions/budget-month";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/types";

const initial: ActionState = { ok: false, error: "" };

export function AllocationForm({
  month,
  categoryId,
  currentPlanned,
}: {
  month: string;
  categoryId: string;
  currentPlanned: string;
}) {
  const boundAction = setAllocationAction.bind(null, month);
  const [state, action, pending] = useActionState(boundAction, initial);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="categoryId" value={categoryId} />
      <input
        name="plannedAmount"
        defaultValue={currentPlanned}
        inputMode="decimal"
        className="border-foreground/25 h-7 w-24 border-b bg-transparent text-sm focus-visible:outline-none"
      />
      <Button type="submit" size="xs" variant="ghost" disabled={pending}>
        {pending ? "…" : "Set"}
      </Button>
      {!state.ok && state.error ? <span className="text-destructive text-xs">{state.error}</span> : null}
    </form>
  );
}
