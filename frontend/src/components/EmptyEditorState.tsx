import { FilePenLine, Search, Sparkles, SquarePen } from "lucide-react";

const EmptyEditorState = () => {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <div className="desktop-editor-header border-b border-[var(--divider)]">
        <div>
          <p className="text-sm text-[var(--muted-text)]">AI Notes</p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em]">Select a note to begin</h2>
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center p-5 md:items-center md:p-8">
        <div className="empty-state-card">
          <div className="empty-state-badge">
            <Sparkles size={14} />
            Ready for your next idea
          </div>

          <h3 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">Your writing workspace is set up</h3>
          <p className="mt-3 max-w-xl text-base leading-7 text-[var(--muted-text)]">
            Pick a note from the list, or create a fresh one from the header. The refreshed layout keeps folders, note context,
            and the assistant visible while you work.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {[
              { icon: SquarePen, title: "Start writing", text: "Create a new note and draft directly in the editor." },
              { icon: Search, title: "Browse context", text: "Use folders and note search to jump into existing work." },
              { icon: FilePenLine, title: "Refine with AI", text: "Use the assistant rail for summaries, edits, and explanation." },
            ].map((item) => (
              <div key={item.title} className="empty-state-feature">
                <item.icon size={18} />
                <h4 className="mt-4 text-lg font-semibold">{item.title}</h4>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-text)]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyEditorState;
