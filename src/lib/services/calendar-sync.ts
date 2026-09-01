/**
 * Task ↔ Google Calendar event mapping. Pure translation only — the HTTP calls
 * and token handling live in `src/lib/google/` (Phase 4).
 *
 * Sync is one-way for v1: Daybook is the source of truth, Google is a mirror.
 */

export interface TaskForSync {
  id: string;
  title: string;
  details?: string | null;
  dueAt: Date | null;
  reminderOffset: number | null; // minutes before dueAt
  completedAt: Date | null;
  timezone: string;
}

export interface GoogleEventPayload {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  reminders: { useDefault: false; overrides: { method: "popup"; minutes: number }[] };
  status: "confirmed" | "cancelled";
}

const DEFAULT_DURATION_MIN = 30;

/** Build the Google Calendar event body for a task. Returns null when the task has no due date. */
export function taskToEvent(task: TaskForSync): GoogleEventPayload | null {
  if (!task.dueAt) return null;
  const start = task.dueAt;
  const end = new Date(start.getTime() + DEFAULT_DURATION_MIN * 60_000);
  const minutes = task.reminderOffset ?? 10;
  return {
    summary: task.title,
    description: task.details ?? undefined,
    start: { dateTime: start.toISOString(), timeZone: task.timezone },
    end: { dateTime: end.toISOString(), timeZone: task.timezone },
    reminders: { useDefault: false, overrides: [{ method: "popup", minutes }] },
    status: task.completedAt ? "cancelled" : "confirmed",
  };
}

export type SyncAction = "create" | "update" | "delete" | "noop";

/** Decide what to do with a task's linked event given its current state. */
export function resolveSyncAction(task: TaskForSync, hasLink: boolean): SyncAction {
  const wantsEvent = Boolean(task.dueAt) && !task.completedAt;
  if (wantsEvent && !hasLink) return "create";
  if (wantsEvent && hasLink) return "update";
  if (!wantsEvent && hasLink) return "delete";
  return "noop";
}
