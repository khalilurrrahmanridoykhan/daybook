import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";

/** Self-service data export — every row Daybook holds for the signed-in user. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [
    tasks,
    notes,
    wallets,
    budgetMonths,
    categories,
    transactions,
    transfers,
    scheduledItems,
    savingsGoals,
  ] = await Promise.all([
    prisma.task.findMany({ where: { userId: user.id } }),
    prisma.note.findMany({ where: { userId: user.id } }),
    prisma.wallet.findMany({ where: { userId: user.id } }),
    prisma.budgetMonth.findMany({
      where: { userId: user.id },
      include: { incomeEntries: true, allocations: true },
    }),
    prisma.category.findMany({ where: { userId: user.id } }),
    prisma.transaction.findMany({ where: { userId: user.id } }),
    prisma.transfer.findMany({ where: { userId: user.id } }),
    prisma.scheduledItem.findMany({ where: { userId: user.id } }),
    prisma.savingsGoal.findMany({ where: { userId: user.id } }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      name: user.name,
      email: user.email,
      timezone: user.timezone,
      currency: user.currency,
      createdAt: user.createdAt,
    },
    tasks,
    notes,
    wallets,
    budgetMonths,
    categories,
    transactions,
    transfers,
    scheduledItems,
    savingsGoals,
  };

  const json = JSON.stringify(
    payload,
    (_key, value) => (typeof value === "bigint" ? value.toString() : value),
    2,
  );

  return new NextResponse(json, {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="daybook-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
