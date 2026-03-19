import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import NoteCard from "@/components/noteCard";
import { useNoteStore } from "@/store/useNoteStore";

const SearchPage = () => {
  const navigate = useNavigate();
  const { notes, fetchNotes, softDeleteNote, togglePinning } = useNoteStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    void fetchNotes(null);
  }, [fetchNotes]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const baseNotes = notes.filter((note) => !note.isDeleted);

    if (!normalized) return baseNotes;

    return baseNotes.filter((note) => {
      const haystack = `${note.title} ${note.content}`.replace(/<[^>]+>/g, " ").toLowerCase();
      return haystack.includes(normalized);
    });
  }, [notes, query]);

  return (
    <div className="mobile-search-page">
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
            onClick={() => navigate(`/note/${note._id}`)}
            onDelete={(id) => void softDeleteNote(id)}
            onTogglePin={(id) => void togglePinning(id)}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
