"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RuledField } from "@/components/auth/ruled-field";
import { SelectLine } from "@/components/settings/select-line";
import { deleteTaskAction, saveTaskAction } from "@/lib/actions/tasks";
import { RECURRENCE_PRESETS } from "@/lib/services/recurring";
import { REMINDER_OFFSETS } from "@/lib/validation/tasks";
import { toDateTimeLocal } from "@/lib/tasks/dates";
import type { ActionState } from "@/lib/actions/types";
import type { ClientTask } from "./types";

const initial: ActionState = { ok: false, error: "" };

export function TaskEditor({
  task,
  timezone,
  trigger,
}: {
  task?: ClientTask;
  timezone: string;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(saveTaskAction, initial);
  const [deleting, startDelete] = useTransition();

  useEffect(() => {
    if (state.ok && open) {
      setOpen(false);
      toast.success(task ? "Task updated." : "Task added.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const fieldErrors = !state.ok ? state.fieldErrors : undefined;
  const dueDefault = task?.dueAt ? toDateTimeLocal(new Date(task.dueAt), timezone) : "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-w-md">
        <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
        <DialogDescription className="text-ink-2 text-sm">
          {task ? "Change any detail and save." : "Fill in what you know; the rest can wait."}
        </DialogDescription>

        <form action={action} className="mt-4 space-y-1">
          {task ? <input type="hidden" name="id" value={task.id} /> : null}

          <RuledField
            label="Title"
            name="title"
            defaultValue={task?.title ?? ""}
            required
            autoFocus
            errors={fieldErrors?.title}
          />

          <div className="py-2">
            <Label htmlFor="details" className="folio">
              Details
            </Label>
            <textarea
              id="details"
              name="details"
              rows={2}
              defaultValue={task?.details ?? ""}
              className="border-foreground/25 focus-visible:border-rule mt-1 w-full resize-y border-0 border-b-2 bg-transparent px-0 text-base focus-visible:outline-none"
            />
          </div>

          <RuledField label="Due" name="dueAt" type="datetime-local" defaultValue={dueDefault} />

          <div className="grid grid-cols-2 gap-4">
            <SelectLine label="Priority" name="priority" defaultValue={task?.priority ?? "MEDIUM"}>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </SelectLine>
            <SelectLine
              label="Reminder"
              name="reminderOffset"
              defaultValue={task?.reminderOffset != null ? String(task.reminderOffset) : ""}
            >
              {REMINDER_OFFSETS.map((o) => (
                <option key={o.label} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectLine>
          </div>

          <SelectLine
            label="Repeat"
            name="recurrenceRule"
            defaultValue={task?.recurrenceRule ?? ""}
          >
            {RECURRENCE_PRESETS.map((p) => (
              <option key={p.label} value={p.value}>
                {p.label}
              </option>
            ))}
          </SelectLine>

          <RuledField
            label="Tags"
            name="tags"
            defaultValue={task?.tags.join(", ") ?? ""}
            placeholder="home, bills"
          />

          {!state.ok && state.error ? (
            <p className="text-destructive pt-2 text-sm" role="alert">
              {state.error}
            </p>
          ) : null}

          <div className="mt-4 flex items-center justify-between gap-2">
            {task ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={deleting}
                onClick={() =>
                  startDelete(async () => {
                    await deleteTaskAction(task.id);
                    setOpen(false);
                    toast.success("Task deleted.");
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : task ? "Save changes" : "Add task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
