"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { categorySchema } from "@/lib/validation/budget";
import { fail, succeed, type ActionState } from "./types";

function revalidate() {
  revalidatePath("/app");
  revalidatePath("/app/budget");
}

async function nextSortOrder(userId: string): Promise<number> {
  const agg = await prisma.category.aggregate({ where: { userId }, _max: { sortOrder: true } });
  return (agg._max.sortOrder ?? 0) + 1;
}

function parseCategoryForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    kind: formData.get("kind") ?? "EXPENSE",
    color: formData.get("color") ?? undefined,
    monthlyDefault: formData.get("monthlyDefault") || "0",
    rolloverEnabled: formData.get("rolloverEnabled") === "on",
  });
}

export async function createCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return fail("Please fix the highlighted fields.", fieldErrors);
  }

  const existing = await prisma.category.findUnique({
    where: { userId_name: { userId: user.id, name: parsed.data.name } },
    select: { id: true },
  });
  if (existing) return fail("You already have a category with that name.");

  await prisma.category.create({
    data: { ...parsed.data, userId: user.id, sortOrder: await nextSortOrder(user.id) },
  });
  revalidate();
  return succeed(undefined);
}

export async function updateCategoryAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const existing = await prisma.category.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!existing) return fail("That category no longer exists.");

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return fail("Please fix the highlighted fields.", fieldErrors);
  }

  await prisma.category.update({ where: { id }, data: parsed.data });
  revalidate();
  return succeed(undefined);
}

export async function archiveCategoryAction(id: string): Promise<void> {
  const user = await requireUser();
  const category = await prisma.category.findFirst({ where: { id, userId: user.id }, select: { archivedAt: true } });
  if (!category) return;
  await prisma.category.update({
    where: { id },
    data: { archivedAt: category.archivedAt ? null : new Date() },
  });
  revalidate();
}
