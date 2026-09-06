import "server-only";
import { prisma } from "@/lib/db";
import { closeMonthForUser } from "@/lib/services/budget-queries";

function previousMonthKey(now: Date): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Runs monthly (see vercel.json). Closes last month's BudgetMonth for every
 * user who has one open, carrying rollover-enabled envelopes forward -- the
 * unattended equivalent of a user clicking "close month" themselves.
 */
export async function runMonthRollover(): Promise<{ closed: number; failed: number }> {
  const month = previousMonthKey(new Date());

  const openMonths = await prisma.budgetMonth.findMany({
    where: { month, closedAt: null },
    select: { userId: true },
  });

  let closed = 0;
  let failed = 0;
  for (const { userId } of openMonths) {
    const result = await closeMonthForUser(userId, month);
    if (result.ok) closed++;
    else failed++;
  }

  return { closed, failed };
}
