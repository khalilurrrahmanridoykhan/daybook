"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { transactionSchema } from "@/lib/validation/budget";
import { getOrCreateBudgetMonth } from "@/lib/services/budget-queries";
import { fail, succeed, type ActionState } from "./types";

function revalidate() {
  revalidatePath("/app");
  revalidatePath("/app/budget");
}

function monthKeyOf(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

async function assertOwnership(
  userId: string,
  fields: { categoryId: string; walletId: string | null; taskId: string | null },
) {
  const category = await prisma.category.findFirst({ where: { id: fields.categoryId, userId } });
  if (!category) return "That category no longer exists.";
  if (fields.walletId) {
    const wallet = await prisma.wallet.findFirst({ where: { id: fields.walletId, userId } });
    if (!wallet) return "That wallet no longer exists.";
  }
  if (fields.taskId) {
    const task = await prisma.task.findFirst({ where: { id: fields.taskId, userId } });
    if (!task) return "That task no longer exists.";
  }
  return null;
}

export async function addTransactionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = transactionSchema.safeParse({
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    direction: formData.get("direction") ?? "EXPENSE",
    walletId: formData.get("walletId") ?? undefined,
    note: formData.get("note") ?? undefined,
    taskId: formData.get("taskId") ?? undefined,
  });
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return fail("Please fix the highlighted fields.", fieldErrors);
  }

  const ownershipError = await assertOwnership(user.id, parsed.data);
  if (ownershipError) return fail(ownershipError);

  const spentAtRaw = formData.get("spentAt");
  const spentAt = typeof spentAtRaw === "string" && spentAtRaw ? new Date(spentAtRaw) : new Date();
  const budgetMonth = await getOrCreateBudgetMonth(user.id, monthKeyOf(spentAt));

  await prisma.transaction.create({
    data: {
      userId: user.id,
      budgetMonthId: budgetMonth.id,
      categoryId: parsed.data.categoryId,
      walletId: parsed.data.walletId,
      taskId: parsed.data.taskId,
      amount: parsed.data.amount,
      direction: parsed.data.direction,
      note: parsed.data.note,
      spentAt,
    },
  });
  revalidate();
  return succeed(undefined);
}

export async function updateTransactionAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const existing = await prisma.transaction.findFirst({ where: { id, userId: user.id } });
  if (!existing) return fail("That transaction no longer exists.");

  const parsed = transactionSchema.safeParse({
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    direction: formData.get("direction") ?? "EXPENSE",
    walletId: formData.get("walletId") ?? undefined,
    note: formData.get("note") ?? undefined,
    taskId: formData.get("taskId") ?? undefined,
  });
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return fail("Please fix the highlighted fields.", fieldErrors);
  }

  const ownershipError = await assertOwnership(user.id, parsed.data);
  if (ownershipError) return fail(ownershipError);

  await prisma.transaction.update({
    where: { id },
    data: {
      categoryId: parsed.data.categoryId,
      walletId: parsed.data.walletId,
      taskId: parsed.data.taskId,
      amount: parsed.data.amount,
      direction: parsed.data.direction,
      note: parsed.data.note,
    },
  });
  revalidate();
  return succeed(undefined);
}

export async function deleteTransactionAction(id: string): Promise<void> {
  const user = await requireUser();
  await prisma.transaction.deleteMany({ where: { id, userId: user.id } });
  revalidate();
}
