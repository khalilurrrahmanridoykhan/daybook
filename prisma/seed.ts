import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo@daybook.local";
const DEMO_PASSWORD = "demo12345";

// major units → minor units (poisha)
const tk = (n: number) => BigInt(Math.round(n * 100));

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      name: "Demo User",
      passwordHash,
      emailVerified: new Date(),
      currency: "BDT",
      timezone: "Asia/Dhaka",
    },
  });

  // wipe the demo user's data so the seed is idempotent
  await prisma.$transaction([
    prisma.transaction.deleteMany({ where: { userId: user.id } }),
    prisma.transfer.deleteMany({ where: { userId: user.id } }),
    prisma.allocation.deleteMany({ where: { budgetMonth: { userId: user.id } } }),
    prisma.incomeEntry.deleteMany({ where: { budgetMonth: { userId: user.id } } }),
    prisma.budgetMonth.deleteMany({ where: { userId: user.id } }),
    prisma.category.deleteMany({ where: { userId: user.id } }),
    prisma.wallet.deleteMany({ where: { userId: user.id } }),
    prisma.task.deleteMany({ where: { userId: user.id } }),
    prisma.note.deleteMany({ where: { userId: user.id } }),
  ]);

  const [cash, bank] = await Promise.all([
    prisma.wallet.create({ data: { userId: user.id, name: "Cash", type: "CASH", sortOrder: 0 } }),
    prisma.wallet.create({
      data: { userId: user.id, name: "Bank", type: "BANK", sortOrder: 1, openingBalance: tk(3000) },
    }),
  ]);

  const categories = await Promise.all(
    [
      {
        name: "Savings",
        kind: "SAVINGS" as const,
        monthlyDefault: tk(20000),
        rolloverEnabled: true,
      },
      {
        name: "Transport, cigarettes, eating out",
        kind: "EXPENSE" as const,
        monthlyDefault: tk(5000),
      },
      { name: "Family food", kind: "EXPENSE" as const, monthlyDefault: tk(10000) },
      { name: "Wife's allowance", kind: "EXPENSE" as const, monthlyDefault: tk(5000) },
    ].map((c, i) => prisma.category.create({ data: { userId: user.id, sortOrder: i, ...c } })),
  );

  const month = new Date().toISOString().slice(0, 7);
  const budgetMonth = await prisma.budgetMonth.create({
    data: {
      userId: user.id,
      month,
      expectedIncome: tk(40000),
      incomeEntries: {
        create: { source: "Salary", amount: tk(40000), walletId: bank.id },
      },
      allocations: {
        create: categories.map((c) => ({
          categoryId: c.id,
          plannedAmount: c.monthlyDefault,
        })),
      },
    },
  });

  const familyFood = categories.find((c) => c.name === "Family food")!;
  const transport = categories.find((c) => c.name.startsWith("Transport"))!;
  const wife = categories.find((c) => c.name.startsWith("Wife"))!;

  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        budgetMonthId: budgetMonth.id,
        categoryId: transport.id,
        walletId: cash.id,
        amount: tk(4300),
        note: "Rides + tea stalls",
      },
      {
        userId: user.id,
        budgetMonthId: budgetMonth.id,
        categoryId: familyFood.id,
        walletId: cash.id,
        amount: tk(10850),
        note: "Groceries — went over",
      },
      {
        userId: user.id,
        budgetMonthId: budgetMonth.id,
        categoryId: wife.id,
        walletId: bank.id,
        amount: tk(5000),
        note: "Monthly transfer",
      },
    ],
  });

  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        title: "Pay electricity bill",
        priority: "HIGH",
        dueAt: new Date(Date.now() + 86_400_000),
      },
      { userId: user.id, title: "Review this month's budget", priority: "MEDIUM" },
      { userId: user.id, title: "Call the landlord", status: "DONE", completedAt: new Date() },
    ],
  });

  await prisma.note.create({
    data: {
      userId: user.id,
      title: "Ideas",
      body: "- Try cooking at home 3 nights/week\n- Move 2k extra into savings next month",
      pinned: true,
    },
  });

  console.log(`Seeded demo user ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
