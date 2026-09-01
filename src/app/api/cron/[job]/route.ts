import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { runRecurring } from "@/lib/cron/recurring";
import { runReminderSweep } from "@/lib/cron/reminders";

/**
 * Vercel Cron entrypoint. Jobs are registered in `vercel.json`; Vercel calls
 * `/api/cron/<job>` on schedule with `Authorization: Bearer $CRON_SECRET`.
 */
const JOBS: Record<string, () => Promise<Record<string, unknown>>> = {
  recurring: runRecurring,
  "reminder-sweep": runReminderSweep,
  // Phase 4
  "google-refresh": async () => ({ skipped: "phase 4" }),
  // Phase 3b
  "month-rollover": async () => ({ skipped: "phase 3b" }),
};

export async function GET(request: Request, { params }: { params: Promise<{ job: string }> }) {
  if (request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { job } = await params;
  const run = JOBS[job];
  if (!run) return NextResponse.json({ error: `unknown job: ${job}` }, { status: 404 });

  try {
    const result = await run();
    return NextResponse.json({ job, ok: true, ...result });
  } catch (error) {
    console.error(`cron ${job} failed`, error);
    return NextResponse.json({ job, ok: false, error: "job failed" }, { status: 500 });
  }
}
