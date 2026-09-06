"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { incomeEntrySchema, allocationSchema } from "@/lib/validation/budget";
import { getOrCreateBudgetMonth, setAllocation, closeMonthForUser } from "@/lib/services/budget-queries";
import { fail, succeed, type ActionState } from "./types";

function revalidate() {
  revalidatePath("/app");
  revalidatePath("/app/budget");
}

export async function addIncomeEntryAction(
  month: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = incomeEntrySchema.safeParse({
    source: formData.get("source"),
    amount: formData.get("amount"),
    walletId: formData.get("walletId") ?? undefined,
  });
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return fail("Please fix the highlighted fields.", fieldErrors);
  }

  if (parsed.data.walletId) {
    const wallet = await prisma.wallet.findFirst({ where: { id: parsed.data.walletId, userId: user.id } });
    if (!wallet) return fail("That wallet no longer exists.");
  }

  const budgetMonth = await getOrCreateBudgetMonth(user.id, month);
  await prisma.incomeEntry.create({
    data: {
      budgetMonthId: budgetMonth.id,
      walletId: parsed.data.walletId,
      source: parsed.data.source,
      amount: parsed.data.amount,
    },
  });
  revalidate();
  return succeed(undefined);
}

export async function setAllocationAction(
  month: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = allocationSchema.safeParse({
    categoryId: formData.get("categoryId"),
    plannedAmount: formData.get("plannedAmount") || undefined,
    plannedPercent: formData.get("plannedPercent") || undefined,
  });
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return fail("Please fix the highlighted fields.", fieldErrors);
  }

  const result = await setAllocation(user.id, month, parsed.data.categoryId, {
    plannedAmount: parsed.data.plannedAmount,
    plannedPercent: parsed.data.plannedPercent,
  });
  if (!result.ok) return fail(result.error);

  revalidate();
  return succeed(undefined);
}

export async function closeMonthAction(month: string): Promise<ActionState> {
  const user = await requireUser();
  const result = await closeMonthForUser(user.id, month);
  if (!result.ok) return fail(result.error);
  revalidate();
  return succeed(undefined);
}
