import { describe, expect, it } from "vitest";
import { clampNonNegative, sum, toMajor, toMinor } from "./money";

describe("toMinor", () => {
  it("parses whole and fractional amounts", () => {
    expect(toMinor("40000")).toBe(4_000_000n);
    expect(toMinor("1250.50")).toBe(125_050n);
    expect(toMinor("0.05")).toBe(5n);
    expect(toMinor(10)).toBe(1000n);
  });

  it("strips thousands separators and handles negatives", () => {
    expect(toMinor("1,250.50")).toBe(125_050n);
    expect(toMinor("-5.00")).toBe(-500n);
  });

  it("truncates beyond the currency precision", () => {
    expect(toMinor("1.999")).toBe(199n);
  });

  it("rejects garbage", () => {
    expect(() => toMinor("abc")).toThrow();
    expect(() => toMinor("1.2.3")).toThrow();
  });
});

describe("toMajor", () => {
  it("round-trips", () => {
    expect(toMajor(125_050n)).toBe(1250.5);
  });
});

describe("helpers", () => {
  it("sums an iterable of bigints", () => {
    expect(sum([1n, 2n, 3n])).toBe(6n);
  });
  it("clamps negatives to zero", () => {
    expect(clampNonNegative(-1n)).toBe(0n);
    expect(clampNonNegative(5n)).toBe(5n);
  });
});

describe("BigInt JSON", () => {
  it("serialises via toJSON", () => {
    expect(JSON.stringify({ amount: 4_000_000n })).toBe('{"amount":"4000000"}');
  });
});
