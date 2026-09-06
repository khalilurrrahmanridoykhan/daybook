import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { WalletForm } from "@/components/budget/wallet-form";
import { CategoryForm } from "@/components/budget/category-form";
import { AllocationForm } from "@/components/budget/allocation-form";
import { TransactionForm } from "@/components/budget/transaction-form";
import { IncomeForm } from "@/components/budget/income-form";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getMonthSummary } from "@/lib/services/budget-queries";
import { toMajor } from "@/lib/money";

export const metadata: Metadata = { title: "Budget" };

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function fmt(minor: bigint): string {
  return toMajor(minor).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function BudgetPage() {
  const user = await requireUser();
  const month = currentMonthKey();

  const [wallets, categories, summary, recentTransactions] = await Promise.all([
    prisma.wallet.findMany({ where: { userId: user.id, archivedAt: null }, orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany({ where: { userId: user.id, archivedAt: null }, orderBy: { sortOrder: "asc" } }),
    getMonthSummary(user.id, month),
    prisma.transaction.findMany({
      where: { userId: user.id },
      include: { category: true, wallet: true },
      orderBy: { spentAt: "desc" },
      take: 15,
    }),
  ]);

  const envelopeByCategory = new Map(summary?.envelopes.map((e) => [e.categoryId, e]) ?? []);

  return (
    <div>
      <PageHeader
        folio="The cash book"
        title="Budget"
        description="Rule the month's income into envelopes, then charge each expense to one."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Income", summary?.income ?? 0n],
          ["Allocated", summary?.allocated ?? 0n],
          ["Spent", summary?.spent ?? 0n],
          ["Left to spend", summary?.leftToSpend ?? 0n],
        ].map(([label, value]) => (
          <div key={label as string} className="sheet p-3">
            <p className="folio">{label as string}</p>
            <p className="mt-1 text-xl tabular-nums">{fmt(value as bigint)}</p>
          </div>
        ))}
      </div>

      <div className="sheet sheet--ruled mb-6 max-w-3xl p-4">
        <h2 className="folio mb-2">Wallets</h2>
        <ul className="mb-3 space-y-1 text-sm">
          {wallets.map((w) => (
            <li key={w.id} className="flex justify-between">
              <span>
                {w.name} <span className="text-ink-3">· {w.type.toLowerCase()}</span>
              </span>
              <span className="tabular-nums">{fmt(w.openingBalance)}</span>
            </li>
          ))}
          {wallets.length === 0 && <li className="text-ink-2 italic">No wallets yet.</li>}
        </ul>
        <WalletForm />
      </div>

      <div className="sheet sheet--ruled mb-6 max-w-3xl p-4">
        <h2 className="folio mb-2">Income this month</h2>
        <IncomeForm month={month} wallets={wallets} />
      </div>

      <div className="sheet sheet--ruled mb-6 max-w-3xl p-4">
        <h2 className="folio mb-2">Categories &amp; envelopes</h2>
        <ul className="mb-3 space-y-2 text-sm">
          {categories.map((c) => {
            const envelope = envelopeByCategory.get(c.id);
            return (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  {c.name} <span className="text-ink-3">· {c.kind.toLowerCase()}</span>
                  {c.rolloverEnabled ? <span className="text-ink-3"> · rolls over</span> : null}
                </span>
                <div className="flex items-center gap-3">
                  {envelope ? (
                    <span className={`tabular-nums ${envelope.overspent ? "text-destructive" : ""}`}>
                      {fmt(envelope.available)} left
                    </span>
                  ) : null}
                  <AllocationForm
                    month={month}
                    categoryId={c.id}
                    currentPlanned={envelope ? String(toMajor(envelope.planned)) : "0"}
                  />
                </div>
              </li>
            );
          })}
          {categories.length === 0 && <li className="text-ink-2 italic">No categories yet.</li>}
        </ul>
        <CategoryForm />
      </div>

      <div className="sheet sheet--ruled max-w-3xl p-4">
        <h2 className="folio mb-2">Transactions</h2>
        <ul className="mb-3 space-y-1 text-sm">
          {recentTransactions.map((t) => (
            <li key={t.id} className="flex justify-between">
              <span>
                {t.category.name}
                {t.wallet ? <span className="text-ink-3"> · {t.wallet.name}</span> : null}
                {t.note ? <span className="text-ink-3"> · {t.note}</span> : null}
              </span>
              <span className={`tabular-nums ${t.direction === "REFUND" ? "text-green-700" : ""}`}>
                {t.direction === "REFUND" ? "+" : "-"}
                {fmt(t.amount)}
              </span>
            </li>
          ))}
          {recentTransactions.length === 0 && <li className="text-ink-2 italic">No transactions yet.</li>}
        </ul>
        <TransactionForm categories={categories} wallets={wallets} />
      </div>
    </div>
  );
}
