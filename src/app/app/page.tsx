import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { sortTasks } from "@/lib/services/tasks";
import { PageHeader } from "@/components/app/page-header";
import { Sheet } from "@/components/ledger/sheet";
import { QuickAdd } from "@/components/tasks/quick-add";
import { TaskList } from "@/components/tasks/task-list";
import { toClientTask } from "@/components/tasks/types";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default async function TodayPage() {
  const user = await requireUser();
  const month = currentMonth();

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [dueSoon, openCount, noteCount, budgetMonth] = await Promise.all([
    prisma.task.findMany({
      where: { userId: user.id, status: { not: "DONE" }, dueAt: { not: null, lte: endOfToday } },
      orderBy: { dueAt: "asc" },
    }),
    prisma.task.count({ where: { userId: user.id, status: { not: "DONE" } } }),
    prisma.note.count({ where: { userId: user.id, archivedAt: null } }),
    prisma.budgetMonth.findUnique({ where: { userId_month: { userId: user.id, month } } }),
  ]);

  const tasks = sortTasks(dueSoon).map(toClientTask);
  const firstName = user.name ? user.name.split(" ")[0] : null;

  const entries = [
    { label: "Tasks open in total", value: String(openCount), href: "/app/tasks" },
    { label: "Notes on file", value: String(noteCount), href: "/app/notes" },
    {
      label: `Budget for ${month}`,
      value: budgetMonth ? "opened" : "not opened",
      href: "/app/budget",
    },
  ];

  return (
    <div className="max-w-2xl">
      <PageHeader
        folio="The day book"
        title={firstName ? `Good day, ${firstName}` : "Good day"}
        description="What's on for today, and the state of your book."
      />

      <Sheet ruled className="mb-6 py-5 pr-6">
        <QuickAdd />
      </Sheet>

      <Sheet ruled className="mb-6 py-5 pr-6">
        <div className="flex items-baseline justify-between border-b pb-2.5">
          <span className="folio">Due today &amp; overdue</span>
          <span className="folio">
            {tasks.length} entr{tasks.length === 1 ? "y" : "ies"}
          </span>
        </div>
        <div className="mt-1">
          <TaskList
            tasks={tasks}
            timezone={user.timezone}
            emptyLabel="Nothing due. Enjoy the clear page."
          />
        </div>
        {tasks.length > 0 ? (
          <Link
            href="/app/tasks?view=upcoming"
            className="folio hover:text-foreground mt-3 inline-flex items-center gap-1"
          >
            See everything upcoming <ArrowUpRight className="h-3 w-3" />
          </Link>
        ) : null}
      </Sheet>

      <Sheet ruled className="py-5 pr-6">
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
    </div>
  );
}
