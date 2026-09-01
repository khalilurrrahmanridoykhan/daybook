import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { PhaseStub } from "@/components/app/phase-stub";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return (
    <div>
      <PageHeader title="Tasks" description="Capture to-dos with due dates, priorities and tags." />
      <PhaseStub phase="Phase 1">
        Task capture, Today / Upcoming / All views, a board, tags and recurring tasks land here.
      </PhaseStub>
    </div>
  );
}
