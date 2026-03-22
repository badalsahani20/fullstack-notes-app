import { Archive, RotateCcw, Star, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { Note } from "@/store/useNoteStore";
import { getRelativeUpdatedLabel } from "@/utils/getRelativeUpdatedLabel";
import { useNoteQuery } from "@/hooks/useNotesQuery";

type NoteCardProps = {
  note: Note;
  isActive: boolean;
  /** When true, shows Restore + Delete Permanently buttons instead of the normal trash icon */
  isTrashView?: boolean;
  isArchiveView?: boolean;
  onClick: () => void;
  onDelete?: (noteId: string) => void;
  onRestore?: (noteId: string) => void;
  onPermanentDelete?: (noteId: string) => void;
  onTogglePin?: (noteId: string) => void;
  onToggleArchive?: (noteId: string) => void;
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
  isArchiveView = false,
  onClick,
  onDelete,
  onRestore,
  onPermanentDelete,
  onTogglePin,
  onToggleArchive,
}: NoteCardProps) => {
  const preview = toPreviewText(note.content || "");
  const queryClient = useQueryClient();

  let hoverTimeout: NodeJS.Timeout;

  const handleHoverStart = (noteId: string) => {
    clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
      queryClient.prefetchQuery({
        queryKey: ["note", noteId],
        queryFn: () => useNoteQuery(noteId),
      });
    }, 150);
};

  return (
    <motion.article
      layout
      layoutId={note._id}
      variants={{
        hidden: { opacity: 0, y: 12, scale: 0.97 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: "spring", stiffness: 500, damping: 35 },
        },
      }}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12, ease: "easeOut" } }}
      whileHover={{ scale: isTrashView ? 1 : 1.015, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      onHoverStart={() => handleHoverStart(note._id)}
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
            className="transition focus:outline-none"
            aria-label={note.pinned ? "Unfavorite note" : "Favorite note"}
          >
            <motion.div
              key={note.pinned ? "pinned" : "unpinned"}
              initial={{ scale: 0.5, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.2, rotate: 15 }}
              whileTap={{ scale: 0.8, rotate: -15 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className={cn("flex items-center justify-center rounded-full p-1 transition-colors", note.pinned ? "hover:bg-amber-500/20 text-amber-500" : "hover:bg-gray-500/20 text-[var(--muted-text)] hover:text-[var(--text-strong)]")}
            >
              <Star size={16} fill={note.pinned ? "currentColor" : "none"} strokeWidth={note.pinned ? 2 : 1.5} />
            </motion.div>
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
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleArchive?.(note._id);
            }}
            className={cn("note-row-delete", isArchiveView && "text-blue-400")}
            aria-label={isArchiveView ? "Unarchive note" : "Archive note"}
            title={isArchiveView ? "Unarchive" : "Archive"}
          >
            <Archive size={14} />
          </button>
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
        </div>
      )}
    </motion.article>
  );
};

export default NoteCard;
