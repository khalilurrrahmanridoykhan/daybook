"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { walletSchema } from "@/lib/validation/budget";
import { fail, succeed, type ActionState } from "./types";

function revalidate() {
  revalidatePath("/app");
  revalidatePath("/app/budget");
}

async function nextSortOrder(userId: string): Promise<number> {
  const agg = await prisma.wallet.aggregate({ where: { userId }, _max: { sortOrder: true } });
  return (agg._max.sortOrder ?? 0) + 1;
}

function parseWalletForm(formData: FormData) {
  return walletSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type") ?? "CASH",
    openingBalance: formData.get("openingBalance") || "0",
  });
}

export async function createWalletAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = parseWalletForm(formData);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return fail("Please fix the highlighted fields.", fieldErrors);
  }
  await prisma.wallet.create({
    data: { ...parsed.data, userId: user.id, sortOrder: await nextSortOrder(user.id) },
  });
  revalidate();
  return succeed(undefined);
}

export async function updateWalletAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const existing = await prisma.wallet.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!existing) return fail("That wallet no longer exists.");

  const parsed = parseWalletForm(formData);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return fail("Please fix the highlighted fields.", fieldErrors);
  }
  await prisma.wallet.update({ where: { id }, data: parsed.data });
  revalidate();
  return succeed(undefined);
}

export async function archiveWalletAction(id: string): Promise<void> {
  const user = await requireUser();
  const wallet = await prisma.wallet.findFirst({ where: { id, userId: user.id }, select: { archivedAt: true } });
  if (!wallet) return;
  await prisma.wallet.update({ where: { id }, data: { archivedAt: wallet.archivedAt ? null : new Date() } });
  revalidate();
}

export async function reorderWalletAction(id: string, direction: "up" | "down"): Promise<void> {
  const user = await requireUser();
  const rows = await prisma.wallet.findMany({
    where: { userId: user.id, archivedAt: null },
    orderBy: { sortOrder: "asc" },
    select: { id: true, sortOrder: true },
  });
  const i = rows.findIndex((r) => r.id === id);
  if (i === -1) return;
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= rows.length) return;

  await prisma.$transaction([
    prisma.wallet.update({ where: { id: rows[i].id }, data: { sortOrder: rows[j].sortOrder } }),
    prisma.wallet.update({ where: { id: rows[j].id }, data: { sortOrder: rows[i].sortOrder } }),
  ]);
  revalidate();
}
