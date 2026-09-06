import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { NoteQuickAdd } from "@/components/notes/note-quick-add";
import { NoteCard } from "@/components/notes/note-card";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Notes" };

export default async function NotesPage() {
  const user = await requireUser();
  const notes = await prisma.note.findMany({
    where: { userId: user.id, archivedAt: null },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <div>
      <PageHeader
        folio="The note book"
        title="Notes"
        description="A fast hand for ideas, links and the gist of a call."
      />

      <div className="sheet sheet--ruled mb-6 max-w-2xl p-4">
        <NoteQuickAdd />
      </div>

      {notes.length === 0 ? (
        <p className="text-ink-2 italic">Nothing written yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
