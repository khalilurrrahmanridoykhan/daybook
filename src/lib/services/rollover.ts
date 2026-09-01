/**
 * Month-close rollover. Pure and framework-agnostic.
 *
 * When a month closes, every rollover-enabled envelope's remaining `available`
 * balance becomes the `rolloverIn` of the same category's allocation in the
 * next month. Positive balances make the envelope richer; negative balances
 * carry the overspend forward as debt.
 */
import type { EnvelopeSummary } from "./budget";

export interface RolloverCategoryConfig {
  categoryId: string;
  rolloverEnabled: boolean;
}

export interface RolloverResult {
  categoryId: string;
  /** amount to write as `Allocation.rolloverIn` on next month */
  rolloverIn: bigint;
}

export function computeRollover(
  envelopes: Pick<EnvelopeSummary, "categoryId" | "available">[],
  configs: RolloverCategoryConfig[],
): RolloverResult[] {
  const enabled = new Set(configs.filter((c) => c.rolloverEnabled).map((c) => c.categoryId));
  return envelopes
    .filter((e) => enabled.has(e.categoryId))
    .map((e) => ({ categoryId: e.categoryId, rolloverIn: e.available }));
}
