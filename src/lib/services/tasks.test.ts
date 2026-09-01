import { describe, expect, it } from "vitest";
import {
  compareTasks,
  distinctTags,
  groupByDay,
  isOverdue,
  matchesFilter,
  sortTasks,
  type TaskLike,
} from "./tasks";

const base: TaskLike = {
  id: "x",
  title: "t",
  status: "TODO",
  priority: "MEDIUM",
  dueAt: null,
  completedAt: null,
  sortOrder: 0,
  tags: [],
};

const make = (p: Partial<TaskLike>): TaskLike => ({
  ...base,
  ...p,
  id: p.id ?? Math.random().toString(),
});

describe("compareTasks / sortTasks", () => {
  it("puts done tasks last", () => {
    const done = make({ id: "d", status: "DONE" });
    const open = make({ id: "o" });
    expect(sortTasks([done, open]).map((t) => t.id)).toEqual(["o", "d"]);
  });

  it("orders by due date, nulls last", () => {
    const soon = make({ id: "soon", dueAt: new Date("2026-09-02") });
    const later = make({ id: "later", dueAt: new Date("2026-09-10") });
    const undated = make({ id: "undated" });
    expect(sortTasks([undated, later, soon]).map((t) => t.id)).toEqual([
      "soon",
      "later",
      "undated",
    ]);
  });

  it("breaks ties by priority then manual order", () => {
    const a = make({ id: "a", priority: "LOW", sortOrder: 1 });
    const b = make({ id: "b", priority: "HIGH", sortOrder: 2 });
    const c = make({ id: "c", priority: "HIGH", sortOrder: 1 });
    expect(sortTasks([a, b, c]).map((t) => t.id)).toEqual(["c", "b", "a"]);
  });

  it("compareTasks is a valid comparator (returns 0 for equal)", () => {
    expect(compareTasks(base, { ...base })).toBe(0);
  });
});

describe("isOverdue", () => {
  const now = new Date("2026-09-05T12:00:00Z");
  it("is true for a past due date on an open task", () => {
    expect(isOverdue(make({ dueAt: new Date("2026-09-04") }), now)).toBe(true);
  });
  it("is false when done or undated or future", () => {
    expect(isOverdue(make({ dueAt: new Date("2026-09-04"), status: "DONE" }), now)).toBe(false);
    expect(isOverdue(make({ dueAt: null }), now)).toBe(false);
    expect(isOverdue(make({ dueAt: new Date("2026-09-09") }), now)).toBe(false);
  });
});

describe("groupByDay", () => {
  const now = new Date("2026-09-05T12:00:00Z");
  const tasks = [
    make({ id: "overdue", dueAt: new Date("2026-09-01T09:00:00Z") }),
    make({ id: "today", dueAt: new Date("2026-09-05T20:00:00Z") }),
    make({ id: "tomorrow", dueAt: new Date("2026-09-06T09:00:00Z") }),
    make({ id: "week", dueAt: new Date("2026-09-10T09:00:00Z") }),
    make({ id: "later", dueAt: new Date("2026-10-01T09:00:00Z") }),
    make({ id: "someday" }),
    make({ id: "done", dueAt: new Date("2026-09-01"), status: "DONE" }),
  ];

  it("sorts open tasks into buckets and drops done", () => {
    const g = groupByDay(tasks, now);
    expect(g.overdue.map((t) => t.id)).toEqual(["overdue"]);
    expect(g.today.map((t) => t.id)).toEqual(["today"]);
    expect(g.tomorrow.map((t) => t.id)).toEqual(["tomorrow"]);
    expect(g.thisWeek.map((t) => t.id)).toEqual(["week"]);
    expect(g.later.map((t) => t.id)).toEqual(["later"]);
    expect(g.someday.map((t) => t.id)).toEqual(["someday"]);
  });
});

describe("matchesFilter", () => {
  const t = make({ status: "DOING", tags: ["home", "bills"], title: "Pay the rent" });
  it("matches status", () => {
    expect(matchesFilter(t, { status: "DOING" })).toBe(true);
    expect(matchesFilter(t, { status: "TODO" })).toBe(false);
    expect(matchesFilter(t, { status: "OPEN" })).toBe(true);
    expect(matchesFilter({ ...t, status: "DONE" }, { status: "OPEN" })).toBe(false);
  });
  it("matches tag and query", () => {
    expect(matchesFilter(t, { tag: "bills" })).toBe(true);
    expect(matchesFilter(t, { tag: "work" })).toBe(false);
    expect(matchesFilter(t, { query: "rent" })).toBe(true);
    expect(matchesFilter(t, { query: "car" })).toBe(false);
  });
});

describe("distinctTags", () => {
  it("returns a sorted unique list", () => {
    expect(distinctTags([{ tags: ["b", "a"] }, { tags: ["a", "c"] }])).toEqual(["a", "b", "c"]);
  });
});
