"use client";

import { useActionState, useEffect, useRef } from "react";
import { addIncomeEntryAction } from "@/lib/actions/budget-month";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/types";
import type { Wallet } from "@/generated/prisma/client";

const initial: ActionState = { ok: false, error: "" };

export function IncomeForm({ month, wallets }: { month: string; wallets: Wallet[] }) {
  const boundAction = addIncomeEntryAction.bind(null, month);
  const [state, action, pending] = useActionState(boundAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-wrap items-end gap-2">
      <input name="source" placeholder="Source (e.g. Salary)" required className="border-foreground/25 h-8 border-b bg-transparent text-sm focus-visible:outline-none" />
      <input name="amount" placeholder="Amount" required inputMode="decimal" className="border-foreground/25 h-8 w-28 border-b bg-transparent text-sm focus-visible:outline-none" />
      <select name="walletId" className="border-foreground/25 h-8 border-b bg-transparent text-sm">
        <option value="">No wallet</option>
        {wallets.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "…" : "Add income"}
      </Button>
      {!state.ok && state.error ? <p className="text-destructive w-full text-xs">{state.error}</p> : null}
    </form>
  );
}
