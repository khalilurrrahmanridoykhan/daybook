import { describe, expect, it } from "vitest";
import { isValidRRule, nextOccurrence, nextOccurrences } from "./recurring";

const from = new Date("2026-09-01T09:00:00Z"); // a Tuesday

describe("nextOccurrence", () => {
  it("advances a daily rule by one day", () => {
    const next = nextOccurrence({ rrule: "FREQ=DAILY", from }, from);
    expect(next?.toISOString()).toBe("2026-09-02T09:00:00.000Z");
  });

  it("advances a weekly rule by seven days", () => {
    const next = nextOccurrence({ rrule: "FREQ=WEEKLY", from }, from);
    expect(next?.toISOString()).toBe("2026-09-08T09:00:00.000Z");
  });

  it("honours a weekday rule (skips the weekend)", () => {
    const friday = new Date("2026-09-04T09:00:00Z");
    const next = nextOccurrence({ rrule: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR", from }, friday);
    expect(next?.getUTCDay()).toBe(1); // Monday
    expect(next?.toISOString()).toBe("2026-09-07T09:00:00.000Z");
  });

  it("returns null past an UNTIL bound", () => {
    const until = new Date("2026-09-05T00:00:00Z");
    const late = new Date("2026-09-04T09:00:00Z");
    expect(nextOccurrence({ rrule: "FREQ=DAILY", from, until }, late)).toBeNull();
  });

  it("returns null for a malformed rule", () => {
    expect(nextOccurrence({ rrule: "NONSENSE", from }, from)).toBeNull();
  });
});

describe("nextOccurrences", () => {
  it("lists the next few dates in order", () => {
    const dates = nextOccurrences({ rrule: "FREQ=WEEKLY", from }, from, 3);
    expect(dates.map((d) => d.toISOString())).toEqual([
      "2026-09-08T09:00:00.000Z",
      "2026-09-15T09:00:00.000Z",
      "2026-09-22T09:00:00.000Z",
    ]);
  });
});

describe("isValidRRule", () => {
  it("accepts an empty rule and well-formed rules", () => {
    expect(isValidRRule("")).toBe(true);
    expect(isValidRRule("FREQ=MONTHLY")).toBe(true);
  });
  it("rejects garbage", () => {
    expect(isValidRRule("FREQ=BANANA")).toBe(false);
  });
});
