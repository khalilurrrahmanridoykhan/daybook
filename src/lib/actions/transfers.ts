"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { transferSchema } from "@/lib/validation/budget";
import { fail, succeed, type ActionState } from "./types";

function revalidate() {
  revalidatePath("/app");
  revalidatePath("/app/budget");
}

export async function createTransferAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = transferSchema.safeParse({
    fromWalletId: formData.get("fromWalletId"),
    toWalletId: formData.get("toWalletId"),
    amount: formData.get("amount"),
    note: formData.get("note") ?? undefined,
  });
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return fail("Please fix the highlighted fields.", fieldErrors);
  }

  const [fromWallet, toWallet] = await Promise.all([
    prisma.wallet.findFirst({ where: { id: parsed.data.fromWalletId, userId: user.id } }),
    prisma.wallet.findFirst({ where: { id: parsed.data.toWalletId, userId: user.id } }),
  ]);
  if (!fromWallet || !toWallet) return fail("One of those wallets no longer exists.");

  await prisma.transfer.create({ data: { ...parsed.data, userId: user.id } });
  revalidate();
  return succeed(undefined);
}

export async function deleteTransferAction(id: string): Promise<void> {
  const user = await requireUser();
  await prisma.transfer.deleteMany({ where: { id, userId: user.id } });
  revalidate();
}
