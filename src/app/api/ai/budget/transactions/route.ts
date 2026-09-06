import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAiAuth } from "@/lib/ai-bridge/auth";
import { txDirectionEnum } from "@/lib/validation/budget";
import { getOrCreateBudgetMonth } from "@/lib/services/budget-queries";
import { toMinor } from "@/lib/money";

// categoryId is exact; categoryName is a convenience for natural-language
// callers ("log a grocery expense") -- resolved case-insensitively, and
// created (as an EXPENSE category) if no match exists, so the AI never has
// to make the user pre-create every category before it can log a spend.
const createTransactionSchema = z
  .object({
    categoryId: z.string().min(1).optional(),
    categoryName: z.string().trim().min(1).max(100).optional(),
    amount: z.union([z.string(), z.number()]),
    direction: txDirectionEnum.optional(),
    walletId: z.string().min(1).optional(),
    note: z.string().trim().max(500).optional(),
    spentAt: z.iso.datetime().optional(),
  })
  .refine((v) => v.categoryId || v.categoryName, { message: "categoryId or categoryName is required" });

function monthKeyOf(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function POST(request: Request) {
  return withAiAuth(request, async (user) => {
    const body = await request.json().catch(() => null);
    const parsed = createTransactionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "invalid transaction" }, { status: 400 });

    let amount: bigint;
    try {
      amount = toMinor(parsed.data.amount);
    } catch {
      return NextResponse.json({ error: "invalid amount" }, { status: 400 });
    }

    let categoryId = parsed.data.categoryId;
    if (!categoryId && parsed.data.categoryName) {
      const existing = await prisma.category.findFirst({
        where: { userId: user.id, name: { equals: parsed.data.categoryName, mode: "insensitive" } },
      });
      if (existing) {
        categoryId = existing.id;
      } else {
        const agg = await prisma.category.aggregate({ where: { userId: user.id }, _max: { sortOrder: true } });
        const created = await prisma.category.create({
          data: {
            userId: user.id,
            name: parsed.data.categoryName,
            kind: "EXPENSE",
            sortOrder: (agg._max.sortOrder ?? 0) + 1,
          },
        });
        categoryId = created.id;
      }
    } else if (categoryId) {
      const category = await prisma.category.findFirst({ where: { id: categoryId, userId: user.id } });
      if (!category) return NextResponse.json({ error: "category not found" }, { status: 404 });
    }

    if (parsed.data.walletId) {
      const wallet = await prisma.wallet.findFirst({ where: { id: parsed.data.walletId, userId: user.id } });
      if (!wallet) return NextResponse.json({ error: "wallet not found" }, { status: 404 });
    }

    const spentAt = parsed.data.spentAt ? new Date(parsed.data.spentAt) : new Date();
    const budgetMonth = await getOrCreateBudgetMonth(user.id, monthKeyOf(spentAt));

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        budgetMonthId: budgetMonth.id,
        categoryId: categoryId!,
        walletId: parsed.data.walletId,
        amount,
        direction: parsed.data.direction ?? "EXPENSE",
        note: parsed.data.note,
        spentAt,
      },
      include: { category: true },
    });
    return NextResponse.json({ transaction }, { status: 201 });
  });
}
