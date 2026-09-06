"use client";

import { useActionState, useEffect, useRef } from "react";
import { saveNoteAction } from "@/lib/actions/notes";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/types";

const initial: ActionState = { ok: false, error: "" };

export function NoteQuickAdd() {
  const [state, action, pending] = useActionState(saveNoteAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-2">
      <input
        name="title"
        placeholder="Title (optional)"
        aria-label="Note title"
        className="border-foreground/25 focus-visible:border-rule h-9 w-full border-b bg-transparent text-base focus-visible:outline-none"
      />
      <textarea
        name="body"
        placeholder="Write something…"
        aria-label="Note body"
        rows={3}
        required
        className="border-foreground/25 focus-visible:border-rule w-full resize-y border-b bg-transparent py-1 text-[0.95rem] focus-visible:outline-none"
      />
      <div className="flex items-center justify-between">
        {!state.ok && state.error ? <p className="text-destructive text-xs">{state.error}</p> : <span />}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Add note"}
        </Button>
      </div>
    </form>
  );
}
