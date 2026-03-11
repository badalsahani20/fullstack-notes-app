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
    <div className="relative flex h-full w-full flex-col items-center justify-center px-5">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(39,197,154,0.15),transparent_35%),radial-gradient(circle_at_85%_75%,rgba(87,139,255,0.14),transparent_40%)]" />

      <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/10 bg-[#111a2b]/70 p-8 backdrop-blur-md">
        <h1 className="mb-2 text-center text-3xl font-semibold text-zinc-100">Capture your next great idea</h1>
        <p className="mb-8 text-center text-sm text-zinc-400">Choose a quick action to start a note in seconds.</p>

        <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="group flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08]"
            >
              <action.icon size={18} className="text-zinc-400 transition group-hover:text-primary" />
              <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeEmptyState;
