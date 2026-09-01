/**
 * Wallet balance math. Pure and framework-agnostic.
 *
 * balance = openingBalance
 *         + Σ income into the wallet
 *         − Σ expense from the wallet (+ Σ refunds)
 *         − Σ transfers out
 *         + Σ transfers in
 */
import type { TxDirection } from "./budget";

export interface WalletMovement {
  walletId: string;
  amount: bigint;
  kind: "income" | "transaction" | "transfer-in" | "transfer-out";
  direction?: TxDirection; // only for kind === "transaction"
}

export function walletBalance(openingBalance: bigint, movements: WalletMovement[]): bigint {
  return movements.reduce((bal, m) => {
    switch (m.kind) {
      case "income":
      case "transfer-in":
        return bal + m.amount;
      case "transfer-out":
        return bal - m.amount;
      case "transaction":
        return m.direction === "REFUND" ? bal + m.amount : bal - m.amount;
      default:
        return bal;
    }
  }, openingBalance);
}
