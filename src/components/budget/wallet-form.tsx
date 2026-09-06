"use client";

import { useActionState, useEffect, useRef } from "react";
import { createWalletAction } from "@/lib/actions/wallets";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/types";

const initial: ActionState = { ok: false, error: "" };

export function WalletForm() {
  const [state, action, pending] = useActionState(createWalletAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-wrap items-end gap-2">
      <input name="name" placeholder="Wallet name" required className="border-foreground/25 h-8 border-b bg-transparent text-sm focus-visible:outline-none" />
      <select name="type" className="border-foreground/25 h-8 border-b bg-transparent text-sm" defaultValue="CASH">
        <option value="CASH">Cash</option>
        <option value="BANK">Bank</option>
        <option value="MOBILE">Mobile</option>
      </select>
      <input
        name="openingBalance"
        placeholder="Opening balance"
        inputMode="decimal"
        className="border-foreground/25 h-8 w-32 border-b bg-transparent text-sm focus-visible:outline-none"
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "…" : "Add wallet"}
      </Button>
      {!state.ok && state.error ? <p className="text-destructive w-full text-xs">{state.error}</p> : null}
    </form>
  );
}
