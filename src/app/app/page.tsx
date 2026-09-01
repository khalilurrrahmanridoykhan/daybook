import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { Sheet } from "@/components/ledger/sheet";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default async function TodayPage() {
  const user = await requireUser();
  const month = currentMonth();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const [dueToday, openTasks, noteCount, budgetMonth] = await Promise.all([
    prisma.task.count({
      where: { userId: user.id, status: { not: "DONE" }, dueAt: { gte: startOfDay, lt: endOfDay } },
    }),
    prisma.task.count({ where: { userId: user.id, status: { not: "DONE" } } }),
    prisma.note.count({ where: { userId: user.id, archivedAt: null } }),
    prisma.budgetMonth.findUnique({ where: { userId_month: { userId: user.id, month } } }),
  ]);

  const entries = [
    { label: "Tasks due today", value: String(dueToday), href: "/app/tasks" },
    { label: "Tasks open in total", value: String(openTasks), href: "/app/tasks" },
    { label: "Notes on file", value: String(noteCount), href: "/app/notes" },
    {
      label: `Budget for ${month}`,
      value: budgetMonth ? "opened" : "not opened",
      href: "/app/budget",
    },
  ];

  const firstName = user.name ? user.name.split(" ")[0] : null;

  return (
    <div>
      <PageHeader
        folio="The day book"
        title={firstName ? `Good day, ${firstName}` : "Good day"}
        description="The state of your book, as it stands this morning."
      />

      <Sheet ruled className="max-w-xl py-5 pr-6">
        <div className="flex items-baseline justify-between border-b pb-2.5">
          <span className="folio">Opening entries</span>
          <span className="folio">Fol. — Today</span>
        </div>
        <ul>
          {entries.map((e) => (
            <li key={e.label} className="border-t border-dotted first:border-t-0">
              <Link
                href={e.href}
                className="group hover:bg-secondary/50 -mx-2 flex items-baseline justify-between gap-4 px-2 py-3 transition-colors"
              >
                <span className="flex items-baseline gap-1.5">
                  {e.label}
                  <ArrowUpRight className="text-ink-3 group-hover:text-foreground h-3.5 w-3.5 -translate-y-0.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                <span className="figure text-[0.95rem]">{e.value}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Sheet>

      <p className="text-ink-3 mt-6 max-w-prose text-sm italic">
        This is the Phase 0 foundation — the book is bound and ruled. Tasks, notes, the budgeting
        pages and calendar sync are entered in the phases that follow.
      </p>
    </div>
  );
}
