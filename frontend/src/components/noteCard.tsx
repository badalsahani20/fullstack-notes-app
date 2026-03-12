import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Note } from "@/store/useNoteStore";
import { getContrastText } from "@/utils/getContrastText";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

type NoteCardProps = {
  note: Note;
  isActive: boolean;
  viewMode?: "list" | "grid";
  onClick: () => void;
  onDelete?: (noteId: string) => void;
};

const toPreviewText = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const NoteCard = ({ note, isActive, viewMode = "list", onClick, onDelete }: NoteCardProps) => {
  const textColor = getContrastText(note.color);
  const preview = toPreviewText(note.content || "");

  return (
    <Card
      onClick={onClick}
      style={{ backgroundColor: note.color || "#253047", color: textColor }}
      className={cn(
        "group relative cursor-pointer gap-0 rounded-xl border py-0 transition-all",
        viewMode === "grid" ? "min-h-[120px]" : "",
        isActive
          ? "border-white/40 shadow-[0_0_0_1px_rgba(255,255,255,0.32),0_12px_28px_rgba(10,15,30,0.35)]"
          : "border-transparent hover:-translate-y-0.5 hover:border-white/25 hover:shadow-[0_10px_22px_rgba(8,12,24,0.25)]"
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

      <CardContent className={cn("px-4 pt-4", viewMode === "grid" ? "pb-2" : "pb-3")}>
        <h3 className="truncate pr-8 text-sm font-semibold">{note.title || "Untitled"}</h3>
        <p className={cn("mt-2 text-xs opacity-90", viewMode === "grid" ? "line-clamp-4" : "line-clamp-2")}>
          {preview || "No content yet"}
        </p>
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between px-4 pb-3">
        <span className="text-[9px] font-bold uppercase tracking-wider opacity-75">
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
      </CardFooter>
    </Card>
  );
};

export default NoteCard;
