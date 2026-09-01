import { TaskItem } from "./task-item";
import type { ClientTask } from "./types";

export function TaskList({
  tasks,
  timezone,
  reorder = false,
  emptyLabel = "Nothing here.",
}: {
  tasks: ClientTask[];
  timezone: string;
  reorder?: boolean;
  emptyLabel?: string;
}) {
  if (tasks.length === 0) {
    return <p className="text-ink-3 py-6 text-sm italic">{emptyLabel}</p>;
  }
  return (
    <ul className="divide-y divide-dotted">
      {tasks.map((t) => (
        <li key={t.id}>
          <TaskItem task={t} timezone={timezone} reorder={reorder} />
        </li>
      ))}
    </ul>
  );
}
