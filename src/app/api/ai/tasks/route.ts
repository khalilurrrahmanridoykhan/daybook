import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAiAuth } from "@/lib/ai-bridge/auth";
import { taskPriorityEnum, taskStatusEnum } from "@/lib/validation/tasks";

const listQuerySchema = z.object({
  status: taskStatusEnum.optional(),
  dueBefore: z.iso.datetime().optional(),
});

const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  details: z.string().trim().max(5000).optional(),
  priority: taskPriorityEnum.optional(),
  dueAt: z.iso.datetime().optional(),
  tags: z.array(z.string()).max(12).optional(),
});

export async function GET(request: Request) {
  return withAiAuth(request, async (user) => {
    const { searchParams } = new URL(request.url);
    const parsed = listQuerySchema.safeParse({
      status: searchParams.get("status") ?? undefined,
      dueBefore: searchParams.get("dueBefore") ?? undefined,
    });
    if (!parsed.success) return NextResponse.json({ error: "invalid query" }, { status: 400 });

    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.dueBefore ? { dueAt: { lte: new Date(parsed.data.dueBefore) } } : {}),
      },
      orderBy: [{ dueAt: "asc" }, { sortOrder: "asc" }],
      take: 100,
    });
    return NextResponse.json({ tasks });
  });
}

export async function POST(request: Request) {
  return withAiAuth(request, async (user) => {
    const body = await request.json().catch(() => null);
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "invalid task" }, { status: 400 });

    const agg = await prisma.task.aggregate({ where: { userId: user.id }, _max: { sortOrder: true } });
    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title: parsed.data.title,
        details: parsed.data.details ?? null,
        priority: parsed.data.priority ?? "MEDIUM",
        dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
        tags: parsed.data.tags ?? [],
        sortOrder: (agg._max.sortOrder ?? 0) + 1,
      },
    });
    return NextResponse.json({ task }, { status: 201 });
  });
}
