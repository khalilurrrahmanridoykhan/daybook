import * as chrono from "chrono-node";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export type ParsedPriority = "LOW" | "MEDIUM" | "HIGH";

export interface ParsedQuickAdd {
  title: string;
  dueAt: Date | null;
  priority: ParsedPriority | null;
  tags: string[];
  /** the human-readable date text that was matched, for a live preview */
  dateText: string | null;
}

const PRIORITY_TOKENS: Record<string, ParsedPriority> = {
  "!1": "HIGH",
  "!high": "HIGH",
  "!hi": "HIGH",
  "!!": "HIGH",
  "!2": "MEDIUM",
  "!med": "MEDIUM",
  "!medium": "MEDIUM",
  "!3": "LOW",
  "!low": "LOW",
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Parse a quick-add string like:
 *   "Pay the rent friday 6pm #home !high"
 * `#tag` sets tags, `!high` / `!1` sets priority, and a natural-language date
 * (via chrono, resolved in the user's timezone) sets the due date — all
 * stripped from the resulting title.
 */
export function parseQuickAdd(
  input: string,
  timeZone: string,
  now: Date = new Date(),
): ParsedQuickAdd {
  let text = input.trim();

  const tags: string[] = [];
  text = text.replace(/(^|\s)#([\p{L}\p{N}_-]+)/gu, (_m, pre: string, tag: string) => {
    tags.push(tag.toLowerCase());
    return pre;
  });

  let priority: ParsedPriority | null = null;
  text = text.replace(/(^|\s)(!!|![a-z0-9]+)/gi, (m: string, pre: string, tok: string) => {
    const hit = PRIORITY_TOKENS[tok.toLowerCase()];
    if (hit) {
      priority = hit;
      return pre;
    }
    return m;
  });

  let dueAt: Date | null = null;
  let dateText: string | null = null;
  const ref = toZonedTime(now, timeZone);
  const results = chrono.parse(text, ref, { forwardDate: true });
  if (results.length) {
    const r = results[0];
    const c = r.start;
    const y = c.get("year");
    const mo = c.get("month");
    const d = c.get("day");
    if (y && mo && d) {
      const h = c.get("hour") ?? 9;
      const mi = c.get("minute") ?? 0;
      dueAt = fromZonedTime(`${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}`, timeZone);
      dateText = r.text;
      text = (text.slice(0, r.index) + text.slice(r.index + r.text.length)).replace(/\s{2,}/g, " ");
    }
  }

  const title = text.replace(/\s{2,}/g, " ").trim();
  return { title, dueAt, priority, tags: [...new Set(tags)], dateText };
}
