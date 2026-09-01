import "server-only";
import { prisma } from "@/lib/db";

/**
 * Raise in-app notifications for tasks whose chosen reminder time has just
 * passed. Google Calendar users get the real reminder from Google (Phase 4);
 * this is the fallback for everyone else.
 */
export async function runReminderSweep(now: Date = new Date()): Promise<{ created: number }> {
  const horizon = new Date(now.getTime() - 60 * 60 * 1000); // don't look back more than an hour

  const candidates = await prisma.task.findMany({
    where: {
      status: { not: "DONE" },
      dueAt: { not: null },
      reminderOffset: { not: null },
    },
    select: { id: true, userId: true, title: true, dueAt: true, reminderOffset: true },
  });

  let created = 0;
  for (const t of candidates) {
    const remindAt = new Date(t.dueAt!.getTime() - (t.reminderOffset ?? 0) * 60_000);
    if (remindAt > now || remindAt < horizon) continue;

    const already = await prisma.notification.findFirst({
      where: { userId: t.userId, kind: "task-due", href: `/app/tasks?open=${t.id}` },
      select: { id: true },
    });
    if (already) continue;

    await prisma.notification.create({
      data: {
        userId: t.userId,
        kind: "task-due",
        title: t.title,
        body: "This task is coming up.",
        href: `/app/tasks?open=${t.id}`,
      },
    });
    created++;
  }

  return { created };
}
