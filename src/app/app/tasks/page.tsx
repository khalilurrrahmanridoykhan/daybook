import type { Metadata } from "next";
import type { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { distinctTags, sortTasks } from "@/lib/services/tasks";
import { PageHeader } from "@/components/app/page-header";
import { Sheet } from "@/components/ledger/sheet";
import { QuickAdd } from "@/components/tasks/quick-add";
import { TaskToolbar } from "@/components/tasks/task-toolbar";
import { TaskList } from "@/components/tasks/task-list";
import { TaskGroups } from "@/components/tasks/task-groups";
import { TaskBoard } from "@/components/tasks/task-board";
import { toClientTask } from "@/components/tasks/types";

export const metadata: Metadata = { title: "Tasks" };

type Params = { view?: string; status?: string; tag?: string; q?: string };

export default async function TasksPage({ searchParams }: { searchParams: Promise<Params> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const view = sp.view === "upcoming" || sp.view === "board" ? sp.view : "list";

  const where: Prisma.TaskWhereInput = { userId: user.id };
  if (sp.status === "OPEN") where.status = { not: "DONE" };
  else if (sp.status === "TODO" || sp.status === "DOING" || sp.status === "DONE")
    where.status = sp.status;
  if (sp.tag) where.tags = { has: sp.tag };
  if (sp.q) where.title = { contains: sp.q, mode: "insensitive" };

  const [rows, allTagRows] = await Promise.all([
    prisma.task.findMany({ where, orderBy: { sortOrder: "asc" } }),
    prisma.task.findMany({ where: { userId: user.id }, select: { tags: true } }),
  ]);

  const tasks = sortTasks(rows).map(toClientTask);
  const tags = distinctTags(allTagRows);
  const unfiltered = !sp.status && !sp.tag && !sp.q;

  return (
    <div className="max-w-2xl">
      <PageHeader
        folio="The task book"
        title="Tasks"
        description="Enter what must be done, with a date and a priority."
      />

      <Sheet ruled className="mb-6 py-5 pr-6">
        <QuickAdd />
      </Sheet>

      <TaskToolbar tags={tags} />

      <div className="mt-6">
        {view === "list" ? (
          <TaskList
            tasks={tasks}
            timezone={user.timezone}
            reorder={unfiltered}
            emptyLabel={
              unfiltered
                ? "No tasks yet. Add the first one above."
                : "Nothing matches those filters."
            }
          />
        ) : null}
        {view === "upcoming" ? <TaskGroups tasks={tasks} timezone={user.timezone} /> : null}
        {view === "board" ? <TaskBoard tasks={tasks} timezone={user.timezone} /> : null}
      </div>
    </div>
  );
}
