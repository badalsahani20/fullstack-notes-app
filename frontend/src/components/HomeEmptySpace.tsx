// src/components/HomeEmptyState.tsx
import { Edit3, CheckSquare, Paperclip, Mic, Video, Image as ImageIcon } from "lucide-react";
import { useNoteStore } from "@/store/useNoteStore";

const HomeEmptyState = () => {
  const { createNote } = useNoteStore();

  const quickActions = [
    { icon: Edit3, label: "Write", onClick: () => createNote(null) },
    { icon: ImageIcon, label: "Capture", onClick: () => {} },
    { icon: CheckSquare, label: "To Do", onClick: () => {} },
    { icon: Paperclip, label: "Attach", onClick: () => {} },
    { icon: Mic, label: "Audio", onClick: () => {} },
    { icon: Video, label: "Video", onClick: () => {} },
  ];

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#0B0B0B] px-4">
      <h1 className="text-3xl font-semibold text-zinc-200 mb-10 tracking-tight">
        Start jotting down your ideas
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-lg w-full">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-800/50 hover:border-emerald-500/30 transition-all group"
          >
            <action.icon size={20} className="text-zinc-500 group-hover:text-emerald-500 transition-colors" />
            <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeEmptyState;