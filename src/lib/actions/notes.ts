"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { noteEditorSchema } from "@/lib/validation/notes";
import { fail, succeed, type ActionState } from "./types";

function revalidate() {
  revalidatePath("/app");
  revalidatePath("/app/notes");
}

/** The full editor — create (no id) or update (id present). */
export async function saveNoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = formData.get("id");

  const parsed = noteEditorSchema.safeParse({
    title: formData.get("title") ?? "",
    body: formData.get("body") ?? "",
    color: formData.get("color") ?? undefined,
  });
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return fail("Please fix the highlighted fields.", fieldErrors);
  }

  const data = { title: parsed.data.title, body: parsed.data.body, color: parsed.data.color };

  if (typeof id === "string" && id) {
    const existing = await prisma.note.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!existing) return fail("That note no longer exists.");
    await prisma.note.update({ where: { id }, data });
  } else {
    await prisma.note.create({ data: { ...data, userId: user.id } });
  }

  revalidate();
  return succeed(undefined);
}

export async function deleteNoteAction(id: string): Promise<void> {
  const user = await requireUser();
  await prisma.note.deleteMany({ where: { id, userId: user.id } });
  revalidate();
}

export async function togglePinNoteAction(id: string): Promise<void> {
  const user = await requireUser();
  const note = await prisma.note.findFirst({ where: { id, userId: user.id }, select: { pinned: true } });
  if (!note) return;
  await prisma.note.update({ where: { id }, data: { pinned: !note.pinned } });
  revalidate();
}

export async function toggleArchiveNoteAction(id: string): Promise<void> {
  const user = await requireUser();
  const note = await prisma.note.findFirst({ where: { id, userId: user.id }, select: { archivedAt: true } });
  if (!note) return;
  await prisma.note.update({ where: { id }, data: { archivedAt: note.archivedAt ? null : new Date() } });
  revalidate();
}

/** Links a task to a note (sets Task.noteId), or unlinks it when noteId is null. Ownership of both rows is checked. */
export async function linkNoteToTaskAction(taskId: string, noteId: string | null): Promise<void> {
  const user = await requireUser();
  const task = await prisma.task.findFirst({ where: { id: taskId, userId: user.id }, select: { id: true } });
  if (!task) return;

  if (noteId !== null) {
    const note = await prisma.note.findFirst({ where: { id: noteId, userId: user.id }, select: { id: true } });
    if (!note) return;
  }

  await prisma.task.update({ where: { id: taskId }, data: { noteId } });
  revalidate();
  revalidatePath("/app/tasks");
}
