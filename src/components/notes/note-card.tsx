"use client";

import { useTransition } from "react";
import { deleteNoteAction, toggleArchiveNoteAction, togglePinNoteAction } from "@/lib/actions/notes";
import { Button } from "@/components/ui/button";
import type { Note } from "@/generated/prisma/client";

export function NoteCard({ note }: { note: Note }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="sheet flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base leading-snug font-medium">{note.title || "Untitled"}</h3>
        <button
          type="button"
          aria-label={note.pinned ? "Unpin note" : "Pin note"}
          disabled={pending}
          onClick={() => startTransition(() => togglePinNoteAction(note.id))}
          className={note.pinned ? "text-rule" : "text-ink-3"}
        >
          ★
        </button>
      </div>
      <p className="text-ink-2 line-clamp-6 text-sm whitespace-pre-wrap">{note.body}</p>
      <div className="mt-1 flex items-center justify-between">
        <span className="folio">{new Date(note.updatedAt).toLocaleDateString()}</span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => startTransition(() => toggleArchiveNoteAction(note.id))}
          >
            {note.archivedAt ? "Unarchive" : "Archive"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => startTransition(() => deleteNoteAction(note.id))}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
