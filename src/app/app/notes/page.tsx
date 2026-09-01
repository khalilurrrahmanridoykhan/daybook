import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { PhaseStub } from "@/components/app/phase-stub";

export const metadata: Metadata = { title: "Notes" };

export default function NotesPage() {
  return (
    <div>
      <PageHeader
        folio="The note book"
        title="Notes"
        description="A fast hand for ideas, links and the gist of a call."
      />
      <PhaseStub phase="Phase 2">
        Quick capture, a markdown editor, pin / colour / archive, full-text search and task links
        land here.
      </PhaseStub>
    </div>
  );
}
