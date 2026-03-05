import { Sparkles } from "lucide-react";

const AiAuditPanel = () => {
  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={18} className="text-indigo-400" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Ai Audit
        </h3>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="bg-zinc-800/50 p-4 rounded-full mb-4">
           <Sparkles size={32} className="text-zinc-600" />
        </div>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Select a note and click "Fix Grammar" to see AI suggestions here.
        </p>
      </div>
    </div>
  )
}

export default AiAuditPanel
