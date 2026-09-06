import { NextResponse } from "next/server";
import { z } from "zod";
import { withAiAuth } from "@/lib/ai-bridge/auth";
import { getMonthSummary } from "@/lib/services/budget-queries";
import "@/lib/money"; // side effect: BigInt.prototype.toJSON, so amounts serialize as strings

const monthSchema = z.string().regex(/^\d{4}-\d{2}$/, "expected YYYY-MM");

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function GET(request: Request) {
  return withAiAuth(request, async (user) => {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month") ?? currentMonthKey();
    const parsed = monthSchema.safeParse(monthParam);
    if (!parsed.success) return NextResponse.json({ error: "invalid month" }, { status: 400 });

    const summary = await getMonthSummary(user.id, parsed.data);
    if (!summary) return NextResponse.json({ month: parsed.data, summary: null });
    return NextResponse.json({ month: parsed.data, summary });
  });
}
