// src/pages/NoteEditor.tsx
import { useParams } from "react-router-dom";
import { useNoteStore } from "@/store/useNoteStore";
import { useEffect, useState } from "react";
import type { Note } from "@/store/useNoteStore";
import AiAuditPanel from "../components/AiAuditPanel";
import { getContrastText } from "@/utils/getContrastText";

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const NoteEditor = () => {
  const { noteId } = useParams();
  const { notes, updateNote } = useNoteStore();
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [showAiAudit, setShowAiAudit] = useState(false);

  const textColor = currentNote ? getContrastText(currentNote.color) : "#ffffff";

  useEffect(() => {
    const note = notes.find((n) => n._id === noteId);
    if (note) setCurrentNote(note);
  }, [noteId, notes]);

  if (!currentNote)
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500">
        Select a note to start writing
      </div>
    );

  return (
    <div
      className="h-full w-full flex flex-col transition-colors duration-500"
      style={{ backgroundColor: currentNote.color}} // 10% opacity version of note color
    >
      {/* Editor Header */}
      <div className="p-6 flex justify-between items-center">
        <input
          className="bg-transparent text-4xl font-bold outline-none w-full"
          style={{ color: textColor }}
          value={currentNote.title}
          onChange={(e) =>
            updateNote(currentNote._id, { title: e.target.value })
          }
        />
      </div>

      {/* Actual Content Area */}
      <div className="flex-1 px-12 pb-12">
        <textarea
          className="w-full h-full bg-transparent text-lg leading-relaxed outline-none resize-none"
          style={{ color: textColor }}
          placeholder="Start jotting down your ideas..."
          value={currentNote.content}
          onChange={(e) =>
            updateNote(currentNote._id, { content: e.target.value })
          }
        />
      </div>
      <div className="flex-1 flex flex-col">
        {/* Editor code from above */}
        {/* Button to toggle AI at bottom right */}
        <button
          onClick={() => setShowAiAudit(!showAiAudit)}
          className="absolute bottom-6 right-6 p-3 bg-emerald-500 rounded-full shadow-lg"
        >
          🪄
        </button>
      </div>

      {showAiAudit && (
        <div className="w-[350px] bg-[#181818] border-l border-zinc-800 animate-in slide-in-from-right">
         <AiAuditPanel />
        </div>
      )}
    </div>
  );
};

export default NoteEditor;
