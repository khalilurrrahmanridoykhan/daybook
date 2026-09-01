import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { differenceInCalendarDays, isSameDay } from "date-fns";

/** Value for an <input type="datetime-local">, in the user's timezone. */
export function toDateTimeLocal(date: Date | null, timeZone: string): string {
  if (!date) return "";
  return formatInTimeZone(date, timeZone, "yyyy-MM-dd'T'HH:mm");
}

/** Parse a datetime-local wall-clock string in the user's timezone into a UTC instant. */
export function fromDateTimeLocal(value: string, timeZone: string): Date | null {
  if (!value) return null;
  const d = fromZonedTime(value, timeZone);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** A short, human due-date label ("Today · 18:00", "Fri 5 Sep", "3 days ago"). */
export function formatDue(date: Date, timeZone: string, now: Date = new Date()): string {
  const zoned = toZonedTime(date, timeZone);
  const zonedNow = toZonedTime(now, timeZone);
  const time = formatInTimeZone(date, timeZone, "HH:mm");
  const hasTime = time !== "00:00";

  if (isSameDay(zoned, zonedNow)) return hasTime ? `Today · ${time}` : "Today";

  const days = differenceInCalendarDays(zoned, zonedNow);
  if (days === 1) return hasTime ? `Tomorrow · ${time}` : "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days < -1) return `${Math.abs(days)} days ago`;

  const fmt = days < 7 && days > 0 ? "EEE d MMM" : "d MMM yyyy";
  return formatInTimeZone(date, timeZone, hasTime ? `${fmt} · HH:mm` : fmt);
}
