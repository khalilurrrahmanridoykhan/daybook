import { describe, expect, it } from "vitest";
import { walletBalance, type WalletMovement } from "./wallets";

const tk = (n: number) => BigInt(n * 100);

describe("walletBalance", () => {
  it("applies income, expenses, refunds and transfers", () => {
    const movements: WalletMovement[] = [
      { walletId: "w", kind: "income", amount: tk(40000) },
      { walletId: "w", kind: "transaction", amount: tk(5000), direction: "EXPENSE" },
      { walletId: "w", kind: "transaction", amount: tk(200), direction: "REFUND" },
      { walletId: "w", kind: "transfer-out", amount: tk(10000) },
      { walletId: "w", kind: "transfer-in", amount: tk(300) },
    ];
    expect(walletBalance(tk(1000), movements)).toBe(tk(26500));
  });

  it("returns the opening balance with no movements", () => {
    expect(walletBalance(tk(3000), [])).toBe(tk(3000));
  });
});
