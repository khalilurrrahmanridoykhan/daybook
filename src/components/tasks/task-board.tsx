"use client";

import { useTransition } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BOARD_COLUMNS, type TaskStatus } from "@/lib/services/tasks";
import { setTaskStatusAction } from "@/lib/actions/tasks";
import { TaskEditor } from "./task-editor";
import { PriorityMark, TaskMeta } from "./task-meta";
import type { ClientTask } from "./types";

const ORDER: TaskStatus[] = ["TODO", "DOING", "DONE"];

function Card({ task, timezone }: { task: ClientTask; timezone: string }) {
  const [pending, start] = useTransition();
  const idx = ORDER.indexOf(task.status);

  const move = (dir: -1 | 1) => {
    const next = ORDER[idx + dir];
    if (next) start(() => setTaskStatusAction(task.id, next));
  };

  return (
    <div className={cn("bg-card border p-3", pending && "opacity-50")}>
      <div className="flex items-start justify-between gap-2">
        <TaskEditor
          task={task}
          timezone={timezone}
          trigger={
            <button type="button" className="text-left text-sm leading-snug hover:underline">
              {task.title}
            </button>
          }
        />
        <PriorityMark priority={task.priority} />
      </div>
      <div className="mt-1.5">
        <TaskMeta task={task} timezone={timezone} />
      </div>
      <div className="text-ink-3 mt-2 flex justify-between">
        <button
          type="button"
          aria-label="Move left"
          disabled={idx === 0}
          onClick={() => move(-1)}
          className="hover:text-foreground disabled:opacity-30"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Move right"
          disabled={idx === ORDER.length - 1}
          onClick={() => move(1)}
          className="hover:text-foreground disabled:opacity-30"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function TaskBoard({ tasks, timezone }: { tasks: ClientTask[]; timezone: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {BOARD_COLUMNS.map((col) => {
        const items = tasks.filter((t) => t.status === col.status);
        return (
          <div key={col.status}>
            <h2 className="folio flex items-baseline gap-2 border-b pb-1.5">
              <span>{col.label}</span>
              <span className="normal-case">· {items.length}</span>
            </h2>
            <div className="mt-3 space-y-2">
              {items.length === 0 ? (
                <p className="text-ink-3 py-3 text-xs italic">Empty</p>
              ) : (
                items.map((t) => <Card key={t.id} task={t} timezone={timezone} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
