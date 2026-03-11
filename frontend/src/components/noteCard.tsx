import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Note } from "@/store/useNoteStore";
import { getContrastText } from "@/utils/getContrastText";

type NoteCardProps = {
  note: Note;
  isActive: boolean;
  onClick: () => void;
  onDelete?: (noteId: string) => void;
};

const toPreviewText = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const NoteCard = ({ note, isActive, onClick, onDelete }: NoteCardProps) => {
  const textColor = getContrastText(note.color);
  const preview = toPreviewText(note.content || "");

  return (
    <div
      onClick={onClick}
      style={{ backgroundColor: note.color || "#253047", color: textColor }}
      className={cn(
        "group relative cursor-pointer rounded-xl border p-4 transition-all",
        isActive
          ? "border-white/40 shadow-[0_0_0_1px_rgba(255,255,255,0.3),0_12px_28px_rgba(10,15,30,0.35)]"
          : "border-transparent hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_10px_22px_rgba(8,12,24,0.25)]"
      )}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.(note._id);
        }}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md border border-black/15 bg-black/10 text-black/70 opacity-0 transition hover:bg-black/20 hover:text-black group-hover:opacity-100"
        aria-label="Delete note"
      >
        <Trash2 size={14} />
      </button>

      <h3 className="truncate pr-8 text-sm font-bold">{note.title || "Untitled"}</h3>

      <p className="mt-1 line-clamp-2 text-[11px] opacity-90">{preview || "No content yet"}</p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-wider opacity-75">
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default NoteCard;
