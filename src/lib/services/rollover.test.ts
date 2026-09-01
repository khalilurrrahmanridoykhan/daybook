import { describe, expect, it } from "vitest";
import { computeRollover } from "./rollover";

const tk = (n: number) => BigInt(n * 100);

describe("computeRollover", () => {
  const envelopes = [
    { categoryId: "savings", available: tk(20000) },
    { categoryId: "transport", available: tk(700) },
    { categoryId: "family", available: tk(-850) },
  ];

  it("only carries rollover-enabled categories", () => {
    const result = computeRollover(envelopes, [
      { categoryId: "savings", rolloverEnabled: true },
      { categoryId: "transport", rolloverEnabled: true },
      { categoryId: "family", rolloverEnabled: false },
    ]);
    expect(result).toEqual([
      { categoryId: "savings", rolloverIn: tk(20000) },
      { categoryId: "transport", rolloverIn: tk(700) },
    ]);
  });

  it("carries negative balances when enabled", () => {
    const result = computeRollover(envelopes, [{ categoryId: "family", rolloverEnabled: true }]);
    expect(result).toEqual([{ categoryId: "family", rolloverIn: tk(-850) }]);
  });

  it("returns nothing when no category rolls over", () => {
    expect(computeRollover(envelopes, [])).toEqual([]);
  });
});
