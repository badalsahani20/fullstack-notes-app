import { useMemo, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import NoteCard from "@/components/noteCard";
import NoteDeleteDialog from "@/components/notes/NoteDeleteDialog";
import { useNotesQuery } from "@/hooks/useNotesQuery";
import { useDeleteNoteMutation, useTogglePinMutation } from "@/hooks/useNotesMutations";

const SearchPage = () => {
  const navigate = useNavigate();
  const { data: notes = [] } = useNotesQuery();
  const { mutateAsync: togglePinning } = useTogglePinMutation();
  const [query, setQuery] = useState("");
  const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState<string | null>(null);
  const { mutateAsync: deleteNoteAsync, isPending: isDeleteNotePending } = useDeleteNoteMutation();

  const [stableNow, setStableNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setStableNow(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirmDelete = async () => {
    if (!pendingDeleteNoteId) return;
    const noteToDelete = notes.find((n) => n._id === pendingDeleteNoteId);
    if (noteToDelete) {
      await deleteNoteAsync({ noteId: pendingDeleteNoteId, version: noteToDelete.version });
    }
    setPendingDeleteNoteId(null);
  };

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const baseNotes = notes.filter((note) => !note.isDeleted);

    if (!normalized) return baseNotes;

    return baseNotes.filter((note) => {
      const haystack = `${note.title} ${note.content}`
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&gt;/g, ">")
        .replace(/&lt;/g, "<")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [notes, query]);

  return (
    <div className="mobile-search-page flex flex-col h-full">
      <div className="mobile-screen-header">
        <h2>Search</h2>
        <p>Find notes, ideas, and saved drafts instantly.</p>
      </div>

      <div className="px-4 pb-3">
        <div className="notes-panel-search">
          <Search size={16} className="text-[var(--muted-text)]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notes..."
            className="notes-panel-search-input"
            autoFocus
          />
        </div>
      </div>

      <div className="px-4 pb-2 text-sm text-[var(--muted-text)]">
        {query.trim() ? `Results (${results.length})` : `All Notes (${results.length})`}
      </div>

      <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto px-3 pb-28">
        {results.map((note) => (
          <NoteCard
            key={note._id}
            note={note}
            isActive={false}
            stableNow={stableNow}
            onClick={() => navigate(`/note/${note._id}`)}
            onDelete={() => setPendingDeleteNoteId(note._id)}
            onTogglePin={(id) => void togglePinning({ noteId: id, version: note.version })}
          />
        ))}
      </div>

      <NoteDeleteDialog
        noteId={pendingDeleteNoteId}
        noteTitle={notes.find((n) => n._id === pendingDeleteNoteId)?.title || "this note"}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteNoteId(null)}
        isPending={isDeleteNotePending}
      />
    </div>
  );
};

export default SearchPage;
