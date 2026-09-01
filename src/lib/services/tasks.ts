/**
 * Task ordering, grouping and filtering. Pure and framework-agnostic —
 * unit-tested in `tasks.test.ts`.
 */
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export type TaskStatus = "TODO" | "DOING" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface TaskLike {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: Date | null;
  completedAt: Date | null;
  sortOrder: number;
  tags: string[];
}

const PRIORITY_RANK: Record<TaskPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

/** Default list order: open first, then by due date (soonest first), priority, manual order. */
export function compareTasks(a: TaskLike, b: TaskLike): number {
  const aDone = a.status === "DONE";
  const bDone = b.status === "DONE";
  if (aDone !== bDone) return aDone ? 1 : -1;

  if (a.dueAt && b.dueAt) {
    const d = a.dueAt.getTime() - b.dueAt.getTime();
    if (d !== 0) return d;
  } else if (a.dueAt) {
    return -1;
  } else if (b.dueAt) {
    return 1;
  }

  const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  if (p !== 0) return p;

  return a.sortOrder - b.sortOrder;
}

export const sortTasks = <T extends TaskLike>(tasks: T[]): T[] => [...tasks].sort(compareTasks);

export function isOverdue(task: TaskLike, now: Date = new Date()): boolean {
  return task.status !== "DONE" && task.dueAt !== null && task.dueAt.getTime() < now.getTime();
}

/** Midnight (as a UTC instant) at the start of `now`'s calendar day in `timeZone`. */
export function startOfDayInZone(now: Date, timeZone: string): Date {
  return fromZonedTime(`${formatInTimeZone(now, timeZone, "yyyy-MM-dd")}T00:00:00`, timeZone);
}

export interface DayGroups<T> {
  overdue: T[];
  today: T[];
  tomorrow: T[];
  thisWeek: T[];
  later: T[];
  someday: T[];
}

/** Group open tasks into buckets for the Upcoming view. Completed tasks are dropped. */
export function groupByDay<T extends TaskLike>(
  tasks: T[],
  now: Date = new Date(),
  timeZone: string = "UTC",
): DayGroups<T> {
  const today0 = startOfDayInZone(now, timeZone);
  const tomorrow0 = new Date(today0.getTime() + 864e5);
  const dayAfter0 = new Date(today0.getTime() + 2 * 864e5);
  const weekEnd0 = new Date(today0.getTime() + 7 * 864e5);

  const groups: DayGroups<T> = {
    overdue: [],
    today: [],
    tomorrow: [],
    thisWeek: [],
    later: [],
    someday: [],
  };

  for (const t of sortTasks(tasks.filter((t) => t.status !== "DONE"))) {
    if (!t.dueAt) {
      groups.someday.push(t);
      continue;
    }
    const due = t.dueAt.getTime();
    if (due < today0.getTime()) groups.overdue.push(t);
    else if (due < tomorrow0.getTime()) groups.today.push(t);
    else if (due < dayAfter0.getTime()) groups.tomorrow.push(t);
    else if (due < weekEnd0.getTime()) groups.thisWeek.push(t);
    else groups.later.push(t);
  }

  return groups;
}

export function distinctTags(tasks: { tags: string[] }[]): string[] {
  return [...new Set(tasks.flatMap((t) => t.tags))].sort((a, b) => a.localeCompare(b));
}

export interface TaskFilter {
  status?: TaskStatus | "OPEN";
  tag?: string;
  query?: string;
}

export function matchesFilter(task: TaskLike, f: TaskFilter): boolean {
  if (f.status === "OPEN" && task.status === "DONE") return false;
  if (f.status && f.status !== "OPEN" && task.status !== f.status) return false;
  if (f.tag && !task.tags.includes(f.tag)) return false;
  if (f.query) {
    const q = f.query.toLowerCase();
    if (!task.title.toLowerCase().includes(q) && !task.tags.some((t) => t.includes(q)))
      return false;
  }
  return true;
}

export const BOARD_COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "TODO", label: "To do" },
  { status: "DOING", label: "Doing" },
  { status: "DONE", label: "Done" },
];
