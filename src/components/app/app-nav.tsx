"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/app", numeral: "I", label: "Today", exact: true },
  { href: "/app/tasks", numeral: "II", label: "Tasks" },
  { href: "/app/notes", numeral: "III", label: "Notes" },
  { href: "/app/budget", numeral: "IV", label: "Budget" },
  { href: "/app/settings", numeral: "V", label: "Settings" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Sections" className="relative md:pl-4">
      {/* the ledger's red margin rule */}
      <span
        aria-hidden
        className="bg-rule/40 absolute top-1 bottom-1 left-1.5 hidden w-px md:block"
      />
      <p className="folio mb-2 hidden md:block">Contents</p>
      <ul className="flex gap-1 md:flex-col md:gap-0.5">
        {links.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-baseline gap-3 px-2.5 py-2 text-[0.98rem] transition-colors",
                  active
                    ? "text-foreground"
                    : "text-ink-2 hover:text-foreground hover:bg-secondary/60",
                )}
              >
                <span
                  className={cn(
                    "font-[family-name:var(--font-mono)] text-[0.68rem] tracking-wider",
                    active ? "text-rule" : "text-ink-3",
                  )}
                >
                  {l.numeral}
                </span>
                <span className={cn(active && "box-shadow-none relative")}>
                  {l.label}
                  {active ? (
                    <span className="bg-rule absolute -bottom-0.5 left-0 h-px w-full" />
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
