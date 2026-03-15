import { Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Note } from "@/store/useNoteStore";
import { getRelativeUpdatedLabel } from "@/utils/getRelativeUpdatedLabel";

type NoteCardProps = {
  note: Note;
  isActive: boolean;
  onClick: () => void;
  onDelete?: (noteId: string) => void;
  onTogglePin?: (noteId: string) => void;
};

const toPreviewText = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const NoteCard = ({ note, isActive, onClick, onDelete, onTogglePin }: NoteCardProps) => {
  const preview = toPreviewText(note.content || "");

  return (
    <article
      onClick={onClick}
      className={cn("note-list-row", isActive && "note-list-row-active")}
      style={{ borderLeftColor: isActive ? "var(--accent-strong)" : "transparent" }}
    >
      <div className="flex min-w-0 flex-1 gap-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onTogglePin?.(note._id);
          }}
          className={cn("mt-0.5 text-[var(--muted-text)] transition", note.pinned && "text-amber-500")}
          aria-label={note.pinned ? "Unfavorite note" : "Favorite note"}
        >
          <Star size={14} fill={note.pinned ? "currentColor" : "none"} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="truncate text-sm font-semibold text-[var(--text-strong)]">{note.title || "Untitled note"}</h3>
            <span className="shrink-0 text-xs text-[var(--muted-text)]">{getRelativeUpdatedLabel(note.updatedAt, Date.now())}</span>
          </div>

          <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-[var(--muted-text)]">
            {preview || "No content yet. Open the editor to start writing."}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete?.(note._id);
        }}
        className="note-row-delete"
        aria-label="Delete note"
      >
        <Trash2 size={14} />
      </button>
    </article>
  );
};

export default NoteCard;
