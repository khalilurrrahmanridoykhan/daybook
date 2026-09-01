/**
 * Envelope-budgeting math. Pure and framework-agnostic — no imports from
 * Prisma, Next, or anything with side effects. Unit-tested in `budget.test.ts`.
 *
 * All amounts are BigInt minor units.
 */

export type TxDirection = "EXPENSE" | "REFUND";

export interface IncomeInput {
  amount: bigint;
}

export interface AllocationInput {
  categoryId: string;
  /** planned split for the month */
  plannedAmount: bigint;
  /** unspent (or, if negative, overspent) balance carried from the previous month */
  rolloverIn: bigint;
}

export interface TransactionInput {
  categoryId: string;
  amount: bigint;
  direction: TxDirection;
}

export interface EnvelopeSummary {
  categoryId: string;
  planned: bigint;
  rolloverIn: bigint;
  /** planned + rolloverIn */
  allocated: bigint;
  /** Σ EXPENSE − Σ REFUND */
  spent: bigint;
  /** allocated − spent (can be negative) */
  available: bigint;
  overspent: boolean;
}

export interface MonthSummary {
  income: bigint;
  /** Σ planned allocations (rollover excluded) */
  planned: bigint;
  /** Σ (planned + rolloverIn) */
  allocated: bigint;
  spent: bigint;
  /** income − Σ planned — what is still free to assign */
  unallocated: bigint;
  /** Σ available across envelopes */
  leftToSpend: bigint;
  envelopes: EnvelopeSummary[];
  overspentCount: number;
}

const sum = (xs: bigint[]) => xs.reduce((a, b) => a + b, 0n);

export function summariseEnvelope(
  allocation: AllocationInput,
  transactions: TransactionInput[],
): EnvelopeSummary {
  const spent = sum(
    transactions
      .filter((t) => t.categoryId === allocation.categoryId)
      .map((t) => (t.direction === "REFUND" ? -t.amount : t.amount)),
  );
  const allocated = allocation.plannedAmount + allocation.rolloverIn;
  const available = allocated - spent;
  return {
    categoryId: allocation.categoryId,
    planned: allocation.plannedAmount,
    rolloverIn: allocation.rolloverIn,
    allocated,
    spent,
    available,
    overspent: available < 0n,
  };
}

export function summariseMonth(input: {
  incomes: IncomeInput[];
  allocations: AllocationInput[];
  transactions: TransactionInput[];
}): MonthSummary {
  const income = sum(input.incomes.map((i) => i.amount));
  const envelopes = input.allocations.map((a) => summariseEnvelope(a, input.transactions));

  const planned = sum(envelopes.map((e) => e.planned));
  const allocated = sum(envelopes.map((e) => e.allocated));
  const spent = sum(envelopes.map((e) => e.spent));

  return {
    income,
    planned,
    allocated,
    spent,
    unallocated: income - planned,
    leftToSpend: sum(envelopes.map((e) => e.available)),
    envelopes,
    overspentCount: envelopes.filter((e) => e.overspent).length,
  };
}

/**
 * Resolve a percentage-based allocation into a concrete minor-unit amount.
 * `percent` is 0–100.
 */
export function resolvePercent(income: bigint, percent: number): bigint {
  if (percent < 0 || percent > 100) throw new Error(`percent out of range: ${percent}`);
  // round to nearest minor unit
  return BigInt(Math.round(Number(income) * (percent / 100)));
}
