import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAiAuth } from "@/lib/ai-bridge/auth";
import { taskStatusEnum } from "@/lib/validation/tasks";

const patchSchema = z.object({
  status: taskStatusEnum.optional(),
  dueAt: z.iso.datetime().nullable().optional(),
  delete: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAiAuth(request, async (user) => {
    const { id } = await params;
    const existing = await prisma.task.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

    const body = await request.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "invalid body" }, { status: 400 });

    if (parsed.data.delete) {
      await prisma.task.delete({ where: { id } });
      return NextResponse.json({ deleted: true });
    }

    const data: { status?: "TODO" | "DOING" | "DONE"; completedAt?: Date | null; dueAt?: Date | null } = {};
    if (parsed.data.status) {
      data.status = parsed.data.status;
      data.completedAt = parsed.data.status === "DONE" ? new Date() : null;
    }
    if (parsed.data.dueAt !== undefined) {
      data.dueAt = parsed.data.dueAt ? new Date(parsed.data.dueAt) : null;
    }

    const task = await prisma.task.update({ where: { id }, data });
    return NextResponse.json({ task });
  });
}
