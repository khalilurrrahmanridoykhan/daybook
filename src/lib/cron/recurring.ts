import "server-only";
import { prisma } from "@/lib/db";
import { nextOccurrence } from "@/lib/services/recurring";

/**
 * Safety net for recurring tasks. Completing a task spawns its successor inline;
 * this catches any chain that ended up with every instance done and no open
 * successor (e.g. an inline spawn that failed).
 */
export async function runRecurring(): Promise<{ spawned: number }> {
  const recurring = await prisma.task.findMany({
    where: { recurrenceRule: { not: null }, dueAt: { not: null } },
    orderBy: { dueAt: "asc" },
  });

  // group into chains
  const chains = new Map<string, typeof recurring>();
  for (const t of recurring) {
    const key = t.parentTaskId ?? t.id;
    const list = chains.get(key) ?? [];
    list.push(t);
    chains.set(key, list);
  }

  let spawned = 0;
  for (const [, list] of chains) {
    if (list.some((t) => t.status !== "DONE")) continue; // an open instance exists

    const latest = list.reduce((a, b) => (a.dueAt! > b.dueAt! ? a : b));
    const next = nextOccurrence(
      { rrule: latest.recurrenceRule!, from: latest.dueAt!, until: latest.recurrenceEnd },
      latest.dueAt!,
    );
    if (!next) continue;
    if (list.some((t) => t.dueAt!.getTime() === next.getTime())) continue;

    await prisma.task.create({
      data: {
        userId: latest.userId,
        title: latest.title,
        details: latest.details,
        priority: latest.priority,
        tags: latest.tags,
        dueAt: next,
        reminderOffset: latest.reminderOffset,
        recurrenceRule: latest.recurrenceRule,
        recurrenceEnd: latest.recurrenceEnd,
        parentTaskId: latest.parentTaskId ?? latest.id,
        sortOrder: latest.sortOrder,
      },
    });
    spawned++;
  }

  return { spawned };
}
