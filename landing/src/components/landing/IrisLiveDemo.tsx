import { useState } from 'react';
import { FileText, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export const IrisLiveDemo = () => {
  const SUGGESTIONS = [
    "Summarize the key findings from the latest AI models report.",
    "Draft a concise email to my team about Q2 metrics.",
    "How can I optimize my MongoDB queries and implement caching?",
  ];

  const [isStreaming, setIsStreaming] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const mockStream = async (text: string) => {
    setIsStreaming(true);
    setResponse("");
    
    const mockReply = `Based on your request regarding "${text.slice(0, 30)}...", here is a synthesized approach:
    
• First, identify the core constraints and objectives of the task.
• Second, utilize Iris's multi-provider routing to select the optimal model.
• Finally, refine the output using context-aware ghostwriting.

This ensures maximum speed and relevance without switching context.`;

    let currentText = "";
    const words = mockReply.split(" ");
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(r => setTimeout(r, 50)); // Mock network delay
      currentText += words[i] + " ";
      setResponse(currentText);
    }
    
    setIsStreaming(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt && !isStreaming) {
      mockStream(prompt);
    }
  };

  return (
    <div className="glass-card overflow-hidden shadow-2xl shadow-indigo-900/10 text-left">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/70" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
          <span className="h-3 w-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <FileText className="h-3.5 w-3.5" />
          <span className="font-mono">live-demo.md</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 px-2 py-1 text-[11px] text-indigo-400 font-medium">
          <Sparkles className="h-3 w-3" /> Iris · live
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5 bg-[#0a0a0a]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-[11px] font-medium tracking-widest text-stone-500 uppercase">
            Type a thought — Iris will continue it
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. I want to start journaling but I never know what to write…"
              rows={3}
              maxLength={500}
              className="w-full resize-none rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-600 outline-none focus:border-indigo-500/50 transition-colors" 
            />
            <span className="absolute bottom-3 right-3 text-[10px] text-stone-500 font-mono">
              {prompt.length}/500
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={isStreaming}
                onClick={() => {
                  setPrompt(s);
                  mockStream(s);
                }}
                className="text-[11px] px-3 py-1.5 rounded-full border border-white/10 text-stone-400 hover:text-white hover:border-white/30 transition-colors disabled:opacity-50 bg-white/5"
              >
                {s.length > 42 ? s.slice(0, 42) + "…" : s}
              </button>
            ))}
          </div>
          
          <button
            type="submit"
            disabled={isStreaming || !prompt.trim()}
            className="flex items-center justify-center gap-2 bg-white text-black hover:bg-stone-200 disabled:bg-white/50 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl text-sm font-bold transition w-full sm:w-auto"
          >
            {isStreaming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Iris is thinking…
              </>
            ) : (
              <>
                Ask Iris
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {(response || isStreaming) && (
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-5 space-y-3 animate-fade-in-up mt-6">
            <div className="flex items-center gap-2 text-[11px] font-medium text-indigo-400 uppercase tracking-wider">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-primary">
                <Sparkles className="h-3 w-3 text-white" />
              </span>
              Iris
              {isStreaming && (
                <span className="flex items-center gap-1 ml-2 text-stone-400 lowercase tracking-normal">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  streaming
                </span>
              )}
            </div>
            <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-wrap font-sans">
              {response}
              {isStreaming && (
                <span className="inline-block w-[2px] h-4 bg-indigo-500 align-middle ml-1 animate-blink" />
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
