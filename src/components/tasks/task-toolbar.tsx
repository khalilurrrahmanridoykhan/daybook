"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const VIEWS = [
  { value: "list", label: "List" },
  { value: "upcoming", label: "Upcoming" },
  { value: "board", label: "Board" },
];

const STATUSES = [
  { value: "", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "TODO", label: "To do" },
  { value: "DOING", label: "Doing" },
  { value: "DONE", label: "Done" },
];

export function TaskToolbar({ tags }: { tags: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const view = params.get("view") ?? "list";
  const [query, setQuery] = useState(params.get("q") ?? "");

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  // debounce the search box
  useEffect(() => {
    const id = setTimeout(() => {
      if ((params.get("q") ?? "") !== query) setParam("q", query);
    }, 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b pb-3">
      <div className="flex gap-4">
        {VIEWS.map((v) => (
          <button
            key={v.value}
            type="button"
            onClick={() => setParam("view", v.value === "list" ? "" : v.value)}
            className={cn(
              "folio relative pb-1",
              view === v.value ? "text-foreground" : "hover:text-foreground",
            )}
          >
            {v.label}
            {view === v.value ? (
              <span className="bg-rule absolute -bottom-[13px] left-0 h-px w-full" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-3">
        <select
          value={params.get("status") ?? ""}
          onChange={(e) => setParam("status", e.target.value)}
          aria-label="Filter by status"
          className="folio border-foreground/25 focus-visible:border-rule border-b bg-transparent pb-1 focus-visible:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {tags.length ? (
          <select
            value={params.get("tag") ?? ""}
            onChange={(e) => setParam("tag", e.target.value)}
            aria-label="Filter by tag"
            className="folio border-foreground/25 focus-visible:border-rule border-b bg-transparent pb-1 focus-visible:outline-none"
          >
            <option value="">All tags</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                #{t}
              </option>
            ))}
          </select>
        ) : null}

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          aria-label="Search tasks"
          className="border-foreground/25 focus-visible:border-rule w-32 border-b bg-transparent pb-1 text-sm focus-visible:outline-none"
        />
      </div>
    </div>
  );
}
