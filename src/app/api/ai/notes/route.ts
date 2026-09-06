import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAiAuth } from "@/lib/ai-bridge/auth";

const createNoteSchema = z.object({
  title: z.string().trim().max(200).optional(),
  body: z.string().trim().max(20000).min(1),
});

export async function GET(request: Request) {
  return withAiAuth(request, async (user) => {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    const notes = await prisma.note.findMany({
      where: {
        userId: user.id,
        archivedAt: null,
        ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { body: { contains: q, mode: "insensitive" } }] } : {}),
      },
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
      take: 50,
    });
    return NextResponse.json({ notes });
  });
}

export async function POST(request: Request) {
  return withAiAuth(request, async (user) => {
    const body = await request.json().catch(() => null);
    const parsed = createNoteSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "invalid note" }, { status: 400 });

    const note = await prisma.note.create({
      data: { userId: user.id, title: parsed.data.title ?? "", body: parsed.data.body },
    });
    return NextResponse.json({ note }, { status: 201 });
  });
}
