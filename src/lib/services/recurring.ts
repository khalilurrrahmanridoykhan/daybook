/**
 * Recurring tasks and scheduled budget items, built on RFC 5545 RRULEs.
 * Pure and framework-agnostic.
 */
import { RRule, rrulestr } from "rrule";

export interface Recurrence {
  /** an RRULE string, with or without the "RRULE:" prefix, e.g. "FREQ=WEEKLY;BYDAY=MO" */
  rrule: string;
  /** anchor / DTSTART */
  from: Date;
  /** optional hard stop */
  until?: Date | null;
}

/** Common presets offered in the task editor. */
export const RECURRENCE_PRESETS = [
  { label: "Does not repeat", value: "" },
  { label: "Every day", value: "FREQ=DAILY" },
  { label: "Every weekday", value: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR" },
  { label: "Every week", value: "FREQ=WEEKLY" },
  { label: "Every 2 weeks", value: "FREQ=WEEKLY;INTERVAL=2" },
  { label: "Every month", value: "FREQ=MONTHLY" },
  { label: "Every year", value: "FREQ=YEARLY" },
] as const;

function build(rec: Recurrence): RRule {
  const body = rec.rrule.replace(/^RRULE:/i, "").trim();
  const options = RRule.parseString(body);
  options.dtstart = rec.from;
  if (rec.until) options.until = rec.until;
  return new RRule(options);
}

/** The next occurrence strictly after `after`, or null when the series has ended. */
export function nextOccurrence(rec: Recurrence, after: Date): Date | null {
  try {
    return build(rec).after(after, false);
  } catch {
    return null;
  }
}

/** Up to `limit` occurrences strictly after `after`. */
export function nextOccurrences(rec: Recurrence, after: Date, limit = 5): Date[] {
  try {
    const rule = build(rec);
    const out: Date[] = [];
    let cursor = after;
    for (let i = 0; i < limit; i++) {
      const next = rule.after(cursor, false);
      if (!next) break;
      out.push(next);
      cursor = next;
    }
    return out;
  } catch {
    return [];
  }
}

export function describeRecurrence(rrule: string): string {
  const preset = RECURRENCE_PRESETS.find((p) => p.value === rrule.replace(/^RRULE:/i, ""));
  if (preset && preset.value) return preset.label;
  try {
    return rrulestr(`RRULE:${rrule.replace(/^RRULE:/i, "")}`).toText();
  } catch {
    return "Repeats";
  }
}

export function isValidRRule(rrule: string): boolean {
  if (!rrule) return true;
  try {
    const options = RRule.parseString(rrule.replace(/^RRULE:/i, ""));
    return typeof options.freq === "number" && Number.isInteger(options.freq);
  } catch {
    return false;
  }
}
