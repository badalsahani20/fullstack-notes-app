import { RotateCcw, Star, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Note } from "@/store/useNoteStore";
import { getRelativeUpdatedLabel } from "@/utils/getRelativeUpdatedLabel";

type NoteCardProps = {
  note: Note;
  isActive: boolean;
  /** When true, shows Restore + Delete Permanently buttons instead of the normal trash icon */
  isTrashView?: boolean;
  onClick: () => void;
  onDelete?: (noteId: string) => void;
  onRestore?: (noteId: string) => void;
  onPermanentDelete?: (noteId: string) => void;
  onTogglePin?: (noteId: string) => void;
};

const toPreviewText = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const NoteCard = ({
  note,
  isActive,
  isTrashView = false,
  onClick,
  onDelete,
  onRestore,
  onPermanentDelete,
  onTogglePin,
}: NoteCardProps) => {
  const preview = toPreviewText(note.content || "");

  return (
    <motion.article
      layout
      variants={{
        hidden: { opacity: 0, y: 15, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } },
      }}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      onClick={onClick}
      className={cn(
        "note-list-row",
        isActive && "note-list-row-active",
        isTrashView && "cursor-default opacity-80"
      )}
      style={{ borderLeftColor: isActive ? "var(--accent-strong)" : "transparent" }}
    >
      <div className="flex min-w-0 flex-1 gap-3">
        {/* Star / favorite button — hidden in trash view */}
        {!isTrashView && (
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
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="truncate text-sm font-semibold text-[var(--text-strong)]">{note.title || "Untitled note"}</h3>
            <span className="shrink-0 text-xs text-[var(--muted-text)]">{getRelativeUpdatedLabel(note.updatedAt, Date.now())}</span>
          </div>

          <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-[var(--muted-text)]">
            {preview || "No content yet."}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      {isTrashView ? (
        /* Trash view: Restore + Delete Permanently */
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRestore?.(note._id);
            }}
            className="note-row-delete text-green-500 hover:text-green-400"
            aria-label="Restore note"
            title="Restore"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPermanentDelete?.(note._id);
            }}
            className="note-row-delete text-red-500 hover:text-red-400"
            aria-label="Permanently delete note"
            title="Delete permanently"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        /* Normal view: soft delete button */
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
      )}
    </motion.article>
  );
};

export default NoteCard;
