import { NextResponse } from "next/server";
import { env } from "@/lib/env";

/**
 * Vercel Cron entrypoint. Configured jobs live in `vercel.json`; Vercel calls
 * `/api/cron/<job>` on schedule with `Authorization: Bearer $CRON_SECRET`.
 *
 * Jobs are implemented in their phases:
 *  - reminder-sweep   → Phase 4 (in-app / web-push alerts for tasks due soon)
 *  - google-refresh   → Phase 4 (refresh expiring Google tokens)
 *  - recurring        → Phase 1 / 3b (materialise recurring tasks & scheduled items)
 *  - month-rollover   → Phase 3b (close finished months, carry rollover forward)
 */
const JOBS = new Set(["reminder-sweep", "google-refresh", "recurring", "month-rollover"]);

export async function GET(request: Request, { params }: { params: Promise<{ job: string }> }) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { job } = await params;
  if (!JOBS.has(job)) {
    return NextResponse.json({ error: `unknown job: ${job}` }, { status: 404 });
  }

  // TODO: dispatch to the job implementation once its phase lands.
  return NextResponse.json({ job, ran: false, note: "not implemented yet" });
}
