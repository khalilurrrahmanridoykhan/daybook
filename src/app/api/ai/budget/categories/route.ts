import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAiAuth } from "@/lib/ai-bridge/auth";

export async function GET(request: Request) {
  return withAiAuth(request, async (user) => {
    const categories = await prisma.category.findMany({
      where: { userId: user.id, archivedAt: null },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ categories });
  });
}
