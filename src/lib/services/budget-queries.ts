import "server-only";
import { prisma } from "@/lib/db";
import { resolvePercent, summariseMonth, type MonthSummary } from "@/lib/services/budget";
import { computeRollover } from "@/lib/services/rollover";
import { walletBalance } from "@/lib/services/wallets";
import "@/lib/money"; // side effect: installs BigInt.prototype.toJSON before any closingSnapshot is stringified

/**
 * Thin, Prisma-touching layer between the pure math in services/budget.ts and
 * services/rollover.ts and the rest of the app -- the future UI, the AI-bridge
 * routes, and this file's own closeMonthForUser() all call these instead of
 * re-fetching rows and re-deriving the math themselves.
 */

export async function getOrCreateBudgetMonth(userId: string, month: string) {
  return prisma.budgetMonth.upsert({
    where: { userId_month: { userId, month } },
    update: {},
    create: { userId, month },
  });
}

export async function getMonthSummary(userId: string, month: string): Promise<MonthSummary | null> {
  const budgetMonth = await prisma.budgetMonth.findUnique({
    where: { userId_month: { userId, month } },
    include: { incomeEntries: true, allocations: true, transactions: true },
  });
  if (!budgetMonth) return null;

  return summariseMonth({
    incomes: budgetMonth.incomeEntries.map((i) => ({ amount: i.amount })),
    allocations: budgetMonth.allocations.map((a) => ({
      categoryId: a.categoryId,
      plannedAmount: a.plannedAmount,
      rolloverIn: a.rolloverIn,
    })),
    transactions: budgetMonth.transactions.map((t) => ({
      categoryId: t.categoryId,
      amount: t.amount,
      direction: t.direction,
    })),
  });
}

export async function getWalletBalance(userId: string, walletId: string): Promise<bigint | null> {
  const wallet = await prisma.wallet.findFirst({ where: { id: walletId, userId } });
  if (!wallet) return null;

  const [incomes, transactions, transfersOut, transfersIn] = await Promise.all([
    prisma.incomeEntry.findMany({ where: { walletId }, select: { amount: true } }),
    prisma.transaction.findMany({ where: { walletId }, select: { amount: true, direction: true } }),
    prisma.transfer.findMany({ where: { fromWalletId: walletId }, select: { amount: true } }),
    prisma.transfer.findMany({ where: { toWalletId: walletId }, select: { amount: true } }),
  ]);

  return walletBalance(wallet.openingBalance, [
    ...incomes.map((i) => ({ walletId, amount: i.amount, kind: "income" as const })),
    ...transactions.map((t) => ({ walletId, amount: t.amount, kind: "transaction" as const, direction: t.direction })),
    ...transfersOut.map((t) => ({ walletId, amount: t.amount, kind: "transfer-out" as const })),
    ...transfersIn.map((t) => ({ walletId, amount: t.amount, kind: "transfer-in" as const })),
  ]);
}

export async function setAllocation(
  userId: string,
  month: string,
  categoryId: string,
  opts: { plannedAmount?: bigint; plannedPercent?: number },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) return { ok: false, error: "That category no longer exists." };

  const budgetMonth = await getOrCreateBudgetMonth(userId, month);

  let plannedAmount = opts.plannedAmount;
  if (plannedAmount === undefined && opts.plannedPercent !== undefined) {
    const incomes = await prisma.incomeEntry.findMany({
      where: { budgetMonthId: budgetMonth.id },
      select: { amount: true },
    });
    const income = incomes.reduce((a, i) => a + i.amount, 0n);
    plannedAmount = resolvePercent(income, opts.plannedPercent);
  }

  await prisma.allocation.upsert({
    where: { budgetMonthId_categoryId: { budgetMonthId: budgetMonth.id, categoryId } },
    update: { plannedAmount: plannedAmount ?? 0n, plannedPercent: opts.plannedPercent ?? null },
    create: {
      budgetMonthId: budgetMonth.id,
      categoryId,
      plannedAmount: plannedAmount ?? 0n,
      plannedPercent: opts.plannedPercent ?? null,
    },
  });
  return { ok: true };
}

function nextMonthKey(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + 1, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Closes one user's month: freezes the summary onto BudgetMonth.closingSnapshot
 * and carries each rollover-enabled category's leftover (or overspend) into
 * next month's Allocation.rolloverIn. Callable both from a user-triggered
 * action and from the unattended month-rollover cron job -- takes a userId
 * directly rather than requireUser(), since a cron job has no session.
 */
export async function closeMonthForUser(
  userId: string,
  month: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const budgetMonth = await prisma.budgetMonth.findUnique({
    where: { userId_month: { userId, month } },
    include: { incomeEntries: true, allocations: { include: { category: true } }, transactions: true },
  });
  if (!budgetMonth) return { ok: false, error: "Nothing to close for that month yet." };
  if (budgetMonth.closedAt) return { ok: false, error: "That month is already closed." };

  const summary = summariseMonth({
    incomes: budgetMonth.incomeEntries.map((i) => ({ amount: i.amount })),
    allocations: budgetMonth.allocations.map((a) => ({
      categoryId: a.categoryId,
      plannedAmount: a.plannedAmount,
      rolloverIn: a.rolloverIn,
    })),
    transactions: budgetMonth.transactions.map((t) => ({
      categoryId: t.categoryId,
      amount: t.amount,
      direction: t.direction,
    })),
  });

  const rollovers = computeRollover(
    summary.envelopes.map((e) => ({ categoryId: e.categoryId, available: e.available })),
    budgetMonth.allocations.map((a) => ({
      categoryId: a.categoryId,
      rolloverEnabled: a.category.rolloverEnabled,
    })),
  );

  await prisma.$transaction(async (tx) => {
    await tx.budgetMonth.update({
      where: { id: budgetMonth.id },
      data: { closedAt: new Date(), closingSnapshot: JSON.parse(JSON.stringify(summary)) },
    });

    if (rollovers.length === 0) return;

    const next = await tx.budgetMonth.upsert({
      where: { userId_month: { userId, month: nextMonthKey(month) } },
      update: {},
      create: { userId, month: nextMonthKey(month) },
    });
    for (const r of rollovers) {
      await tx.allocation.upsert({
        where: { budgetMonthId_categoryId: { budgetMonthId: next.id, categoryId: r.categoryId } },
        update: { rolloverIn: r.rolloverIn },
        create: { budgetMonthId: next.id, categoryId: r.categoryId, rolloverIn: r.rolloverIn },
      });
    }
  });

  return { ok: true };
}
