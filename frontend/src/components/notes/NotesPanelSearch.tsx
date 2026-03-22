import { forwardRef } from "react";
import { Plus, Search, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

type NotesPanelSearchProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onCreateNote: () => void;
  isPending: boolean;
  onOpenFavorites: () => void;
  isFavoritesView: boolean;
};

/**
 * The search bar row inside the notes list panel.
 * Contains the search icon, the text input, and the "+" create-note button.
 *
 * Completely stateless — parent owns the query value and the create action.
 */
const NotesPanelSearch = forwardRef<HTMLInputElement, NotesPanelSearchProps>(({
  query,
  onQueryChange,
  onCreateNote,
  isPending,
  onOpenFavorites,
  isFavoritesView,
}, ref) => {
  return (
    <div className="px-4 pb-3">
      <div className="notes-panel-search">
        <Search size={16} className="text-[var(--muted-text)]" />
        <Input
          ref={ref}
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
          <motion.div
            key={isFavoritesView ? "pinned" : "unpinned"}
            initial={{ scale: 0.5, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.2, rotate: 15 }}
            whileTap={{ scale: 0.8, rotate: -15 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex items-center justify-center"
          >
            <Star size={16} fill={isFavoritesView ? "currentColor" : "none"} />
          </motion.div>
        </button>
        <button
          type="button"
          className="notes-panel-plus-button"
          aria-label="Create note"
          onClick={onCreateNote}
          disabled={isPending}
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
});

NotesPanelSearch.displayName = "NotesPanelSearch";
export default NotesPanelSearch;
