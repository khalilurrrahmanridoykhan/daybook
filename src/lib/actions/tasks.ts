"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { parseQuickAdd } from "@/lib/tasks/parse";
import { fromDateTimeLocal } from "@/lib/tasks/dates";
import { nextOccurrence } from "@/lib/services/recurring";
import { taskEditorSchema, taskStatusEnum } from "@/lib/validation/tasks";
import { fail, succeed, type ActionState } from "./types";
import type { Task } from "@/generated/prisma/client";

function revalidate() {
  revalidatePath("/app");
  revalidatePath("/app/tasks");
}

function parseTags(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string") return [];
  return [
    ...new Set(
      raw
        .split(/[,\n]/)
        .map((t) => t.trim().replace(/^#/, "").toLowerCase())
        .filter(Boolean),
    ),
  ].slice(0, 12);
}

function parseOffset(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

async function nextSortOrder(userId: string): Promise<number> {
  const agg = await prisma.task.aggregate({ where: { userId }, _max: { sortOrder: true } });
  return (agg._max.sortOrder ?? 0) + 1;
}

/** The quick-add bar: one line of natural language → a task. */
export async function quickAddTaskAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const input = String(formData.get("input") ?? "").trim();
  if (!input) return fail("Type something to add.");

  const parsed = parseQuickAdd(input, user.timezone, new Date());
  if (!parsed.title) return fail("Add a few words describing the task.");

  await prisma.task.create({
    data: {
      userId: user.id,
      title: parsed.title.slice(0, 200),
      dueAt: parsed.dueAt,
      priority: parsed.priority ?? "MEDIUM",
      tags: parsed.tags,
      sortOrder: await nextSortOrder(user.id),
    },
  });
  revalidate();
  return succeed(undefined);
}

/** The full editor — create (no id) or update (id present). */
export async function saveTaskAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = formData.get("id");

  const parsed = taskEditorSchema.safeParse({
    title: formData.get("title"),
    details: formData.get("details") ?? undefined,
    priority: formData.get("priority") ?? "MEDIUM",
    recurrenceRule: formData.get("recurrenceRule") ?? "",
  });
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return fail("Please fix the highlighted fields.", fieldErrors);
  }

  const dueRaw = formData.get("dueAt");
  const data = {
    title: parsed.data.title,
    details: parsed.data.details,
    priority: parsed.data.priority,
    recurrenceRule: parsed.data.recurrenceRule || null,
    dueAt: typeof dueRaw === "string" ? fromDateTimeLocal(dueRaw, user.timezone) : null,
    reminderOffset: parseOffset(formData.get("reminderOffset")),
    tags: parseTags(formData.get("tags")),
  };

  if (typeof id === "string" && id) {
    const existing = await prisma.task.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });
    if (!existing) return fail("That task no longer exists.");
    await prisma.task.update({ where: { id }, data });
  } else {
    await prisma.task.create({
      data: { ...data, userId: user.id, sortOrder: await nextSortOrder(user.id) },
    });
  }

  revalidate();
  return succeed(undefined);
}

async function spawnNextRecurrence(task: Task) {
  if (!task.recurrenceRule || !task.dueAt) return;
  const next = nextOccurrence(
    { rrule: task.recurrenceRule, from: task.dueAt, until: task.recurrenceEnd },
    task.dueAt,
  );
  if (!next) return;

  await prisma.task.create({
    data: {
      userId: task.userId,
      title: task.title,
      details: task.details,
      priority: task.priority,
      tags: task.tags,
      dueAt: next,
      reminderOffset: task.reminderOffset,
      recurrenceRule: task.recurrenceRule,
      recurrenceEnd: task.recurrenceEnd,
      parentTaskId: task.parentTaskId ?? task.id,
      sortOrder: task.sortOrder,
    },
  });
}

export async function setTaskStatusAction(id: string, status: string): Promise<void> {
  const user = await requireUser();
  const parsed = taskStatusEnum.safeParse(status);
  if (!parsed.success) return;

  const task = await prisma.task.findFirst({ where: { id, userId: user.id } });
  if (!task) return;

  const wasDone = task.status === "DONE";
  const nowDone = parsed.data === "DONE";

  const updated = await prisma.task.update({
    where: { id },
    data: { status: parsed.data, completedAt: nowDone ? new Date() : null },
  });

  if (nowDone && !wasDone) await spawnNextRecurrence(updated);
  revalidate();
}

export async function deleteTaskAction(id: string): Promise<void> {
  const user = await requireUser();
  await prisma.task.deleteMany({ where: { id, userId: user.id } });
  revalidate();
}

export async function reorderTaskAction(id: string, direction: "up" | "down"): Promise<void> {
  const user = await requireUser();
  const rows = await prisma.task.findMany({
    where: { userId: user.id, status: { not: "DONE" } },
    orderBy: { sortOrder: "asc" },
    select: { id: true, sortOrder: true },
  });
  const i = rows.findIndex((r) => r.id === id);
  if (i === -1) return;
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= rows.length) return;

  await prisma.$transaction([
    prisma.task.update({ where: { id: rows[i].id }, data: { sortOrder: rows[j].sortOrder } }),
    prisma.task.update({ where: { id: rows[j].id }, data: { sortOrder: rows[i].sortOrder } }),
  ]);
  revalidate();
}

export async function bulkCompleteAction(ids: string[]): Promise<void> {
  const user = await requireUser();
  await prisma.task.updateMany({
    where: { id: { in: ids }, userId: user.id },
    data: { status: "DONE", completedAt: new Date() },
  });
  revalidate();
}
