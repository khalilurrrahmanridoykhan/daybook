"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { quickAddTaskAction } from "@/lib/actions/tasks";
import { previewQuickAdd } from "@/lib/tasks/preview";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/types";

const initial: ActionState = { ok: false, error: "" };

export function QuickAdd() {
  const [state, action, pending] = useActionState(quickAddTaskAction, initial);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const preview = previewQuickAdd(value);

  useEffect(() => {
    if (state.ok) {
      setValue("");
      inputRef.current?.focus();
    }
  }, [state]);

  // press "c" or "n" anywhere (outside a field) to jump to the quick-add
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement)?.tagName ?? "";
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
      if (e.key === "c" || e.key === "n") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form action={action}>
      <div className="border-foreground/25 focus-within:border-rule flex items-center gap-2 border-b-2 transition-colors">
        <span className="folio shrink-0">Add</span>
        <input
          ref={inputRef}
          name="input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Pay the rent friday 6pm #home !high"
          aria-label="Quick-add a task"
          className="h-10 min-w-0 flex-1 bg-transparent text-base focus-visible:outline-none"
        />
        <Button type="submit" size="sm" disabled={pending || !value.trim()}>
          {pending ? "…" : "Enter"}
        </Button>
      </div>

      <p className="folio mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {preview.priority ? (
          <span className="text-rule">{preview.priority.toLowerCase()}</span>
        ) : null}
        {preview.tags.map((t) => (
          <span key={t}>#{t}</span>
        ))}
        <span className="text-ink-3/70 normal-case">
          try “tomorrow 9am”, “#tag”, “!high”, then press Enter
        </span>
      </p>

      {!state.ok && state.error ? (
        <p className="text-destructive mt-1 text-xs">{state.error}</p>
      ) : null}
    </form>
  );
}
