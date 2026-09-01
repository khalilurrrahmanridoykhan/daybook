/**
 * Recurring tasks and scheduled budget items.
 *
 * Phase 1 (tasks) and Phase 3b (scheduled income/expense) flesh this out using
 * an RRULE parser (`rrule`). Kept as a typed contract for now so callers and
 * tests can be written against it.
 */

export interface Recurrence {
  /** RFC 5545 RRULE string, e.g. "FREQ=MONTHLY;BYMONTHDAY=1" */
  rrule: string;
  /** anchor / DTSTART */
  from: Date;
  /** optional UNTIL */
  until?: Date;
}

export type MaterialiseFn = (rec: Recurrence, after: Date, limit?: number) => Date[];

/** Next occurrences strictly after `after`, up to `limit`. Implemented in a later phase. */
export const nextOccurrences: MaterialiseFn = () => {
  throw new Error("recurring.nextOccurrences is not implemented yet (Phase 1)");
};
