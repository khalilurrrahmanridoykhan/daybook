"use client";

import { useActionState, useEffect, useRef } from "react";
import { addTransactionAction } from "@/lib/actions/transactions";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/types";
import type { Category, Wallet } from "@/generated/prisma/client";

const initial: ActionState = { ok: false, error: "" };

export function TransactionForm({ categories, wallets }: { categories: Category[]; wallets: Wallet[] }) {
  const [state, action, pending] = useActionState(addTransactionAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-wrap items-end gap-2">
      <input
        name="amount"
        placeholder="Amount"
        required
        inputMode="decimal"
        className="border-foreground/25 h-8 w-28 border-b bg-transparent text-sm focus-visible:outline-none"
      />
      <select name="categoryId" required className="border-foreground/25 h-8 border-b bg-transparent text-sm">
        <option value="">Category…</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select name="walletId" className="border-foreground/25 h-8 border-b bg-transparent text-sm">
        <option value="">No wallet</option>
        {wallets.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
      <select name="direction" defaultValue="EXPENSE" className="border-foreground/25 h-8 border-b bg-transparent text-sm">
        <option value="EXPENSE">Expense</option>
        <option value="REFUND">Refund</option>
      </select>
      <input
        name="note"
        placeholder="Note (optional)"
        className="border-foreground/25 h-8 border-b bg-transparent text-sm focus-visible:outline-none"
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "…" : "Log it"}
      </Button>
      {!state.ok && state.error ? <p className="text-destructive w-full text-xs">{state.error}</p> : null}
    </form>
  );
}
