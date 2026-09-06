import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAiAuth } from "@/lib/ai-bridge/auth";

const patchSchema = z.object({
  pinned: z.boolean().optional(),
  archived: z.boolean().optional(),
  title: z.string().trim().max(200).optional(),
  body: z.string().trim().max(20000).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAiAuth(request, async (user) => {
    const { id } = await params;
    const existing = await prisma.note.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

    const body = await request.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "invalid body" }, { status: 400 });

    const data: { pinned?: boolean; archivedAt?: Date | null; title?: string; body?: string } = {};
    if (parsed.data.pinned !== undefined) data.pinned = parsed.data.pinned;
    if (parsed.data.archived !== undefined) data.archivedAt = parsed.data.archived ? new Date() : null;
    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.body !== undefined) data.body = parsed.data.body;

    const note = await prisma.note.update({ where: { id }, data });
    return NextResponse.json({ note });
  });
}
