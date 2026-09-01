import { groupByDay, type DayGroups, type TaskLike } from "@/lib/services/tasks";
import { TaskItem } from "./task-item";
import type { ClientTask } from "./types";

const SECTIONS: { key: keyof DayGroups<TaskLike>; label: string }[] = [
  { key: "overdue", label: "Overdue" },
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "thisWeek", label: "This week" },
  { key: "later", label: "Later" },
  { key: "someday", label: "Someday — no date" },
];

function asTaskLike(t: ClientTask, i: number): TaskLike {
  return {
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    dueAt: t.dueAt ? new Date(t.dueAt) : null,
    completedAt: t.completedAt ? new Date(t.completedAt) : null,
    sortOrder: i,
    tags: t.tags,
  };
}

export function TaskGroups({ tasks, timezone }: { tasks: ClientTask[]; timezone: string }) {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const groups = groupByDay(tasks.map(asTaskLike), new Date(), timezone);

  const visible = SECTIONS.filter((s) => groups[s.key].length > 0);
  if (visible.length === 0) {
    return (
      <p className="text-ink-3 py-6 text-sm italic">No open tasks with a date. A clean book.</p>
    );
  }

  return (
    <div className="space-y-7">
      {visible.map((s) => (
        <section key={s.key}>
          <h2 className="folio flex items-baseline gap-2 border-b pb-1.5">
            <span>{s.label}</span>
            <span className="normal-case">· {groups[s.key].length}</span>
          </h2>
          <ul className="mt-1 divide-y divide-dotted">
            {groups[s.key].map((g) => {
              const task = byId.get(g.id);
              return task ? (
                <li key={g.id}>
                  <TaskItem task={task} timezone={timezone} />
                </li>
              ) : null;
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
