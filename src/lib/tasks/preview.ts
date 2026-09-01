import type { ParsedPriority } from "./parse";

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

/** Cheap, client-safe preview of a quick-add string (tags + priority only). */
export function previewQuickAdd(input: string): {
  title: string;
  tags: string[];
  priority: ParsedPriority | null;
} {
  const tags: string[] = [];
  let priority: ParsedPriority | null = null;
  let text = input;

  text = text.replace(/(^|\s)#([\p{L}\p{N}_-]+)/gu, (_m, pre: string, tag: string) => {
    tags.push(tag.toLowerCase());
    return pre;
  });
  text = text.replace(/(^|\s)(!!|![a-z0-9]+)/gi, (m: string, pre: string, tok: string) => {
    const hit = PRIORITY_TOKENS[tok.toLowerCase()];
    if (hit) {
      priority = hit;
      return pre;
    }
    return m;
  });

  return { title: text.replace(/\s{2,}/g, " ").trim(), tags: [...new Set(tags)], priority };
}
