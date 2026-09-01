import { describe, expect, it } from "vitest";
import {
  resolvePercent,
  summariseMonth,
  type AllocationInput,
  type TransactionInput,
} from "./budget";

const tk = (n: number) => BigInt(n * 100);

/**
 * The user's worked example: 40,000 salary →
 *   savings 20,000 · transport 5,000 · family food 10,000 · wife 5,000
 * with real spending, one envelope going over.
 */
describe("summariseMonth — user's example", () => {
  const allocations: AllocationInput[] = [
    { categoryId: "savings", plannedAmount: tk(20000), rolloverIn: 0n },
    { categoryId: "transport", plannedAmount: tk(5000), rolloverIn: 0n },
    { categoryId: "family", plannedAmount: tk(10000), rolloverIn: 0n },
    { categoryId: "wife", plannedAmount: tk(5000), rolloverIn: 0n },
  ];
  const transactions: TransactionInput[] = [
    { categoryId: "transport", amount: tk(4300), direction: "EXPENSE" },
    { categoryId: "family", amount: tk(10850), direction: "EXPENSE" },
    { categoryId: "wife", amount: tk(5000), direction: "EXPENSE" },
  ];

  const summary = summariseMonth({
    incomes: [{ amount: tk(40000) }],
    allocations,
    transactions,
  });

  it("fully allocates the income", () => {
    expect(summary.income).toBe(tk(40000));
    expect(summary.planned).toBe(tk(40000));
    expect(summary.unallocated).toBe(0n);
  });

  it("computes per-envelope available", () => {
    const family = summary.envelopes.find((e) => e.categoryId === "family")!;
    expect(family.spent).toBe(tk(10850));
    expect(family.available).toBe(tk(-850));
    expect(family.overspent).toBe(true);

    const transport = summary.envelopes.find((e) => e.categoryId === "transport")!;
    expect(transport.available).toBe(tk(700));
    expect(transport.overspent).toBe(false);
  });

  it("flags exactly one overspent envelope", () => {
    expect(summary.overspentCount).toBe(1);
  });

  it("tracks total spent and what is left to spend", () => {
    expect(summary.spent).toBe(tk(20150));
    expect(summary.leftToSpend).toBe(tk(19850));
  });
});

describe("rollover feeds the next month", () => {
  it("adds a positive carry to allocated and available", () => {
    const s = summariseMonth({
      incomes: [{ amount: tk(5000) }],
      allocations: [{ categoryId: "transport", plannedAmount: tk(5000), rolloverIn: tk(700) }],
      transactions: [{ categoryId: "transport", amount: tk(1000), direction: "EXPENSE" }],
    });
    const env = s.envelopes[0];
    expect(env.allocated).toBe(tk(5700));
    expect(env.available).toBe(tk(4700));
  });

  it("carries an overspend forward as debt", () => {
    const s = summariseMonth({
      incomes: [{ amount: tk(10000) }],
      allocations: [{ categoryId: "family", plannedAmount: tk(10000), rolloverIn: tk(-850) }],
      transactions: [],
    });
    expect(s.envelopes[0].available).toBe(tk(9150));
  });
});

describe("refunds reduce spent", () => {
  it("nets EXPENSE and REFUND", () => {
    const s = summariseMonth({
      incomes: [],
      allocations: [{ categoryId: "x", plannedAmount: tk(1000), rolloverIn: 0n }],
      transactions: [
        { categoryId: "x", amount: tk(400), direction: "EXPENSE" },
        { categoryId: "x", amount: tk(100), direction: "REFUND" },
      ],
    });
    expect(s.envelopes[0].spent).toBe(tk(300));
    expect(s.envelopes[0].available).toBe(tk(700));
  });
});

describe("resolvePercent", () => {
  it("splits income by percentage", () => {
    expect(resolvePercent(tk(40000), 50)).toBe(tk(20000));
    expect(resolvePercent(tk(40000), 12.5)).toBe(tk(5000));
  });
  it("rejects out-of-range percentages", () => {
    expect(() => resolvePercent(tk(1), -1)).toThrow();
    expect(() => resolvePercent(tk(1), 101)).toThrow();
  });
});
