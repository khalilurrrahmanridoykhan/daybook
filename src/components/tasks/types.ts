export type ClientTask = {
  id: string;
  title: string;
  details: string | null;
  status: "TODO" | "DOING" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueAt: string | null; // ISO
  reminderOffset: number | null;
  tags: string[];
  recurrenceRule: string | null;
  completedAt: string | null; // ISO
};

import type { Task } from "@/generated/prisma/client";

export function toClientTask(t: Task): ClientTask {
  return {
    id: t.id,
    title: t.title,
    details: t.details,
    status: t.status,
    priority: t.priority,
    dueAt: t.dueAt ? t.dueAt.toISOString() : null,
    reminderOffset: t.reminderOffset,
    tags: t.tags,
    recurrenceRule: t.recurrenceRule,
    completedAt: t.completedAt ? t.completedAt.toISOString() : null,
  };
}
