import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAiAuth } from "@/lib/ai-bridge/auth";
import { walletTypeEnum } from "@/lib/validation/budget";
import { toMinor } from "@/lib/money";

const createWalletSchema = z.object({
  name: z.string().trim().min(1).max(100),
  type: walletTypeEnum.optional(),
  openingBalance: z.union([z.string(), z.number()]).optional(),
});

export async function GET(request: Request) {
  return withAiAuth(request, async (user) => {
    const wallets = await prisma.wallet.findMany({
      where: { userId: user.id, archivedAt: null },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ wallets });
  });
}

export async function POST(request: Request) {
  return withAiAuth(request, async (user) => {
    const body = await request.json().catch(() => null);
    const parsed = createWalletSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "invalid wallet" }, { status: 400 });

    let openingBalance = 0n;
    if (parsed.data.openingBalance !== undefined) {
      try {
        openingBalance = toMinor(parsed.data.openingBalance);
      } catch {
        return NextResponse.json({ error: "invalid openingBalance" }, { status: 400 });
      }
    }

    const agg = await prisma.wallet.aggregate({ where: { userId: user.id }, _max: { sortOrder: true } });
    const wallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        type: parsed.data.type ?? "CASH",
        openingBalance,
        sortOrder: (agg._max.sortOrder ?? 0) + 1,
      },
    });
    return NextResponse.json({ wallet }, { status: 201 });
  });
}
