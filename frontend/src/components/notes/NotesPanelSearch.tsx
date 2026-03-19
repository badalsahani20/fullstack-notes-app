import { Plus, Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";

type NotesPanelSearchProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onCreateNote: () => void;
  onOpenFavorites: () => void;
  isFavoritesView: boolean;
};

/**
 * The search bar row inside the notes list panel.
 * Contains the search icon, the text input, and the "+" create-note button.
 *
 * Completely stateless — parent owns the query value and the create action.
 */
const NotesPanelSearch = ({
  query,
  onQueryChange,
  onCreateNote,
  onOpenFavorites,
  isFavoritesView,
}: NotesPanelSearchProps) => {
  return (
    <div className="px-4 pb-3">
      <div className="notes-panel-search">
        <Search size={16} className="text-[var(--muted-text)]" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search notes..."
          className="notes-panel-search-input"
        />
        <button
          type="button"
          className={`notes-panel-favorites-button ${isFavoritesView ? "notes-panel-favorites-button-active" : ""}`}
          aria-label="Open starred notes"
          onClick={onOpenFavorites}
        >
          <Star size={14} fill={isFavoritesView ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          className="notes-panel-plus-button"
          aria-label="Create note"
          onClick={onCreateNote}
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
};

export default NotesPanelSearch;
