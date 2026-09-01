"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  CheckSquare,
  LayoutDashboard,
  NotebookPen,
  Settings,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/app", label: "Today", icon: LayoutDashboard, exact: true },
  { href: "/app/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/app/notes", label: "Notes", icon: NotebookPen },
  { href: "/app/budget", label: "Budget", icon: Wallet },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 md:flex-col">
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <l.icon className="h-4 w-4 shrink-0" />
            <span>{l.label}</span>
          </Link>
        );
      })}
      <span className="text-muted-foreground/60 mt-2 hidden items-center gap-2 px-3 text-xs md:flex">
        <CalendarClock className="h-3.5 w-3.5" />
        Calendar sync — Phase 4
      </span>
    </nav>
  );
}
