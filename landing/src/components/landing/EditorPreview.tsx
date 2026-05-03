import { FileText, Hash, Bold, Italic, List, Image as ImageIcon, Sparkles } from 'lucide-react';

export const EditorPreview = () => {
  return (
    <div className="glass-card overflow-hidden shadow-2xl shadow-orange-900/20 relative z-10">
      {/* Window chrome */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/70" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
          <span className="h-3 w-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <FileText className="h-3.5 w-3.5" />
          <span className="font-mono">product-launch-notes.md</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-stone-500 hidden sm:inline">Synced</span>
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-white/10 bg-white/5">
        {[Hash, Bold, Italic, List, ImageIcon].map((Icon, i) => (
          <button
            key={i}
            className="h-7 w-7 inline-flex items-center justify-center rounded-md text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
        <div className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-orange-500/10 border border-orange-500/30 px-2 py-1 text-[11px] text-orange-400 font-medium">
          <Sparkles className="h-3 w-3" /> Iris is on
        </div>
      </div>

      {/* Editor body */}
      <div className="p-6 sm:p-8 font-sans space-y-4 text-left bg-[#0a0a0a]">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Q4 Product Launch Plan
        </h2>
        <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
          We're shipping the new editor experience with focus on{" "}
          <span className="text-white">speed</span>,{" "}
          <span className="text-white">clarity</span>, and{" "}
          <span className="bg-indigo-500/30 text-white rounded px-1 relative group/sel">
            collaboration
            {/* Action Menu Popup - Now Below Text */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-32 glass-card p-1.5 shadow-xl animate-fade-in-up border border-indigo-500/30">
              <div className="flex flex-col gap-1 text-[10px] font-bold">
                <button className="flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded text-indigo-400 transition-colors">
                  <Sparkles className="size-3" />
                  ASK IRIS
                </button>
                <div className="h-px bg-white/10 mx-1" />
                <button className="flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded text-stone-400 transition-colors">
                  CONTINUE
                </button>
              </div>
              {/* Arrow - Pointing Up */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[4px] border-b-indigo-500/30"></div>
            </div>
          </span>. The launch will roll out in
          three phases over the next four weeks
          <span className="text-stone-600 italic">
            , beginning with our early access community on November 4th
          </span>
          <span className="inline-block w-[2px] h-4 bg-orange-500 align-middle ml-0.5 animate-blink" />
        </p>

        <div className="pt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            <span className="text-stone-400">Phase 1 — Internal beta</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            <span className="text-stone-400">Phase 2 — Early access cohort</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="text-stone-400">Phase 3 — Public launch</span>
          </div>
        </div>
      </div>
    </div>
  );
};
