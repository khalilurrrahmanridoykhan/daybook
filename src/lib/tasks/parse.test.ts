import { describe, expect, it } from "vitest";
import { parseQuickAdd } from "./parse";

const TZ = "Asia/Dhaka";
const ref = new Date("2026-09-01T06:00:00Z"); // Tue 1 Sep, noon in Dhaka (UTC+6)

describe("parseQuickAdd", () => {
  it("keeps a plain title untouched", () => {
    const r = parseQuickAdd("Call the landlord", TZ, ref);
    expect(r.title).toBe("Call the landlord");
    expect(r.dueAt).toBeNull();
    expect(r.tags).toEqual([]);
    expect(r.priority).toBeNull();
  });

  it("extracts #tags", () => {
    const r = parseQuickAdd("Buy milk #home #groceries", TZ, ref);
    expect(r.title).toBe("Buy milk");
    expect(r.tags).toEqual(["home", "groceries"]);
  });

  it("extracts !priority in several forms", () => {
    expect(parseQuickAdd("Pay rent !high", TZ, ref).priority).toBe("HIGH");
    expect(parseQuickAdd("Pay rent !1", TZ, ref).priority).toBe("HIGH");
    expect(parseQuickAdd("Tidy desk !low", TZ, ref).priority).toBe("LOW");
    expect(parseQuickAdd("Ping Sam !!", TZ, ref).priority).toBe("HIGH");
  });

  it("resolves a natural date in the user's timezone", () => {
    const r = parseQuickAdd("Pay the rent tomorrow 6pm", TZ, ref);
    expect(r.title).toBe("Pay the rent");
    expect(r.dueAt).not.toBeNull();
    // 2 Sep 18:00 Dhaka == 12:00Z
    expect(r.dueAt!.toISOString()).toBe("2026-09-02T12:00:00.000Z");
  });

  it("combines date, tag and priority", () => {
    const r = parseQuickAdd("Submit report friday #work !high", TZ, ref);
    expect(r.title).toBe("Submit report");
    expect(r.tags).toEqual(["work"]);
    expect(r.priority).toBe("HIGH");
    expect(r.dueAt).not.toBeNull();
  });
});
