import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";

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

  const cards = [
    { label: "Due today", value: dueToday, href: "/app/tasks" },
    { label: "Open tasks", value: openTasks, href: "/app/tasks" },
    { label: "Notes", value: noteCount, href: "/app/notes" },
    {
      label: `Budget · ${month}`,
      value: budgetMonth ? "Set up" : "Not started",
      href: "/app/budget",
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Hello${user.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Your day at a glance."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-card hover:border-primary/40 rounded-lg border p-4 transition-colors"
          >
            <div className="text-muted-foreground text-xs">{c.label}</div>
            <div className="font-heading tabular mt-1 text-2xl">{c.value}</div>
          </Link>
        ))}
      </div>

      <p className="text-muted-foreground mt-8 text-sm">
        This is the Phase&nbsp;0 foundation. Tasks, notes, budgeting and calendar sync arrive in the
        following phases — see the{" "}
        <span className="font-mono text-xs">plans/peaceful-swimming-milner.md</span> roadmap.
      </p>
    </div>
  );
}
