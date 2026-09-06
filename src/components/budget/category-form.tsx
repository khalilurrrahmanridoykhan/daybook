"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCategoryAction } from "@/lib/actions/categories";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/types";

const initial: ActionState = { ok: false, error: "" };

export function CategoryForm() {
  const [state, action, pending] = useActionState(createCategoryAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-wrap items-end gap-2">
      <input name="name" placeholder="Category name" required className="border-foreground/25 h-8 border-b bg-transparent text-sm focus-visible:outline-none" />
      <select name="kind" className="border-foreground/25 h-8 border-b bg-transparent text-sm" defaultValue="EXPENSE">
        <option value="EXPENSE">Expense</option>
        <option value="SAVINGS">Savings</option>
      </select>
      <label className="flex items-center gap-1 text-sm">
        <input type="checkbox" name="rolloverEnabled" /> Roll over unspent
      </label>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "…" : "Add category"}
      </Button>
      {!state.ok && state.error ? <p className="text-destructive w-full text-xs">{state.error}</p> : null}
    </form>
  );
}
