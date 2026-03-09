import { cn } from "@/lib/utils"
import type { Note } from "@/store/useNoteStore"
import { getContrastText } from "@/utils/getContrastText"

type NoteCardProps = {
  note: Note
  isActive: boolean
  onClick: () => void
}

const NoteCard = ({note, isActive, onClick} : NoteCardProps) => {
    const textColor = getContrastText(note.color);
    return (
        <div 
            onClick={onClick}
            style={{backgroundColor: note.color, color: textColor}}
            className={cn(
                "group text-zinc-900 relative p-4 rounded-xl transition-all cursor-pointer border border-transparent",
                isActive ? "shadow:violet-500 shadow-lg" : "hover:bg-[#252525]"
            )}
        >
            <h3 className="text-sm font-bold truncate">
                {note.title || "Untitled"}
            </h3>

            <p className="text-[11px] line-clamp-2 mt-1">
                {note.content || "No content yet!"}
            </p>

            <div className="flex justify-between items-center mt-3">
                <span className="text-[9px] font-bold uppercase">
                    {new Date(note.updatedAt).toLocaleDateString()}
                </span>
            </div>
        </div>
    )
}

export default NoteCard;