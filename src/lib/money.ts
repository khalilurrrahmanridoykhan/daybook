/**
 * Money in Daybook is stored and computed as BigInt **minor units** (poisha for
 * BDT, cents for USD, …). Never use floats for money.
 *
 * This module is framework-agnostic and safe to import anywhere.
 */

// Let BigInt survive JSON.stringify in route handlers. Server Components / RSC
// already serialize BigInt natively; this covers the REST edges.
declare global {
  interface BigInt {
    toJSON(): string;
  }
}
if (typeof BigInt.prototype.toJSON !== "function") {
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };
}

export type Minor = bigint;

/** Parse a user-entered major-unit string ("1,250.50") into minor units. */
export function toMinor(input: string | number, fractionDigits = 2): Minor {
  const raw = String(input).trim().replace(/,/g, "");
  if (raw === "" || !/^-?\d*(\.\d*)?$/.test(raw)) {
    throw new Error(`Not a valid amount: ${JSON.stringify(input)}`);
  }
  const negative = raw.startsWith("-");
  const [whole, frac = ""] = raw.replace("-", "").split(".");
  const padded = (frac + "0".repeat(fractionDigits)).slice(0, fractionDigits);
  const value = BigInt(whole || "0") * 10n ** BigInt(fractionDigits) + BigInt(padded || "0");
  return negative ? -value : value;
}

/** Convert minor units back to a plain major-unit number (for display/formatting only). */
export function toMajor(minor: Minor, fractionDigits = 2): number {
  return Number(minor) / 10 ** fractionDigits;
}

export const sum = (values: Iterable<Minor>): Minor => {
  let total = 0n;
  for (const v of values) total += v;
  return total;
};

export const clampNonNegative = (v: Minor): Minor => (v < 0n ? 0n : v);
