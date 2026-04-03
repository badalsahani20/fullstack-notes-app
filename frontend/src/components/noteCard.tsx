import { Archive, RotateCcw, Star, Trash2, X, MoreVertical } from "lucide-react";
import { stripHtml } from "@/utils/stripHtml";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { Note } from "@/store/useNoteStore";
import { getRelativeUpdatedLabel } from "@/utils/getRelativeUpdatedLabel";
import { useNoteQuery } from "@/hooks/useNotesQuery";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
  const preview = stripHtml(note.content || "");
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
      layout="position"
      layoutId={note._id}
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.96, filter: "blur(4px)" },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: { type: "spring", stiffness: 400, damping: 28, mass: 0.8 },
        },
      }}
      initial="hidden"
      animate="show"
      exit={{
        opacity: 0,
        y: -8,
        scale: 0.96,
        filter: "blur(2px)",
        transition: { duration: 0.2, ease: [0.32, 0, 0.67, 0] },
      }}
      whileHover={{ scale: isTrashView ? 1 : 1.018, y: isTrashView ? 0 : -1, transition: { type: "spring", stiffness: 400, damping: 20 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onHoverStart={() => handleHoverStart(note._id)}
      draggable
      onDragStart={(e: any) => {
        e.dataTransfer.setData("application/notesify-note", JSON.stringify({ 
          noteId: note._id, 
          version: note.version 
        }));
        e.dataTransfer.effectAllowed = "move";
      }}
      className={cn(
        "note-list-row group",
        isActive && "note-list-row-active",
        isTrashView && "cursor-default opacity-80"
      )}
      style={{ borderLeftColor: isActive ? "var(--accent-strong)" : "transparent" }}
    >
      <div className="flex min-w-0 flex-1 gap-3 cursor-pointer">
        {/* Star / favorite button — hidden in trash view */}
        {!isTrashView && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onTogglePin?.(note._id);
            }}
            className="transition focus:outline-none cursor-pointer"
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
      <div className="flex shrink-0 items-center">
        {isTrashView ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onRestore?.(note._id);
              }}
              className="note-row-delete text-green-500 hover:text-green-400"
              aria-label="Restore note"
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
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="cursor-pointer note-row-delete opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 hover:bg-[var(--surface-ghost)] rounded-md text-[var(--muted-text)] hover:text-[var(--text-strong)]"
                aria-label="More actions"
              >
                <MoreVertical size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem className="cursor-pointer" onClick={() => onToggleArchive?.(note._id)}>
                <Archive size={14} className="mr-2" />
                {isArchiveView ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete?.(note._id)} className="text-red-500 focus:text-red-500 cursor-pointer">
                <Trash2 size={14} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </motion.article>
  );
};

export default NoteCard;
