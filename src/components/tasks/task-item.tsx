"use client";

import { useTransition } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { reorderTaskAction, setTaskStatusAction } from "@/lib/actions/tasks";
import { TaskEditor } from "./task-editor";
import { PriorityMark, TaskMeta } from "./task-meta";
import type { ClientTask } from "./types";

export function TaskItem({
  task,
  timezone,
  reorder = false,
}: {
  task: ClientTask;
  timezone: string;
  reorder?: boolean;
}) {
  const [pending, start] = useTransition();
  const done = task.status === "DONE";

  return (
    <div className={cn("group flex items-start gap-3 py-2.5", pending && "opacity-50")}>
      <button
        type="button"
        aria-label={done ? "Mark as not done" : "Mark as done"}
        onClick={() => start(() => setTaskStatusAction(task.id, done ? "TODO" : "DONE"))}
        className={cn(
          "mt-[3px] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[2px] border transition-colors",
          done
            ? "border-rule bg-rule text-primary-foreground"
            : "border-foreground/40 hover:border-rule",
        )}
      >
        {done ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </button>

      <div className="min-w-0 flex-1">
        <TaskEditor
          task={task}
          timezone={timezone}
          trigger={
            <button
              type="button"
              className={cn(
                "hover:decoration-rule text-left text-[0.98rem] leading-snug hover:underline hover:underline-offset-2",
                done && "text-ink-3 line-through",
              )}
            >
              {task.title}
            </button>
          }
        />
        <div className="mt-1">
          <TaskMeta task={task} timezone={timezone} />
        </div>
      </div>

      <PriorityMark priority={task.priority} />

      {reorder ? (
        <div className="flex flex-col opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            aria-label="Move up"
            onClick={() => start(() => reorderTaskAction(task.id, "up"))}
            className="text-ink-3 hover:text-foreground"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Move down"
            onClick={() => start(() => reorderTaskAction(task.id, "down"))}
            className="text-ink-3 hover:text-foreground"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
