"use client";

import { useState } from "react";
import { Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDue } from "@/lib/tasks/dates";
import { describeRecurrence } from "@/lib/services/recurring";
import type { ClientTask } from "./types";

const PRIORITY_MARK: Record<
  ClientTask["priority"],
  { mark: string; label: string; className: string }
> = {
  HIGH: { mark: "!!!", label: "High priority", className: "text-rule" },
  MEDIUM: { mark: "!!", label: "Medium priority", className: "text-ink-3" },
  LOW: { mark: "!", label: "Low priority", className: "text-ink-3" },
};

export function PriorityMark({ priority }: { priority: ClientTask["priority"] }) {
  if (priority === "MEDIUM") return null;
  const p = PRIORITY_MARK[priority];
  return (
    <span
      title={p.label}
      className={cn(
        "font-[family-name:var(--font-mono)] text-[0.7rem] tracking-tight",
        p.className,
      )}
    >
      {p.mark}
    </span>
  );
}

export function TaskMeta({ task, timezone }: { task: ClientTask; timezone: string }) {
  const [now] = useState(() => Date.now());
  const due = task.dueAt ? new Date(task.dueAt) : null;
  const overdue = due !== null && task.status !== "DONE" && due.getTime() < now;

  return (
    <span className="text-ink-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      {due ? (
        <span className={cn("font-[family-name:var(--font-mono)]", overdue && "text-rule")}>
          {formatDue(due, timezone)}
        </span>
      ) : null}
      {task.recurrenceRule ? (
        <span className="inline-flex items-center gap-1">
          <Repeat className="h-3 w-3" />
          {describeRecurrence(task.recurrenceRule)}
        </span>
      ) : null}
      {task.tags.map((t) => (
        <span key={t} className="font-[family-name:var(--font-mono)]">
          #{t}
        </span>
      ))}
    </span>
  );
}
