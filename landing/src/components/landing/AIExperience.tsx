import { FadeIn } from '../ui/FadeIn';
import { EditorPreview } from './EditorPreview';

const HighlightIcon = ({ title }: { title: string }) => {
  const baseClasses = "shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all duration-300 group-hover:scale-110";

  if (title === "Multi-provider AI") {
    return (
      <div className={baseClasses}>
        <svg className="h-5 w-5 text-indigo-500 overflow-visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" className="transition-all duration-500 group-hover:translate-y-[-2px]" />
          <path d="M12 2L2 7l10 5 10-5-10-5z" className="transition-all duration-500 group-hover:translate-y-[-4px]" />
        </svg>
      </div>
    );
  }

  if (title === "Streaming responses") {
    return (
      <div className={baseClasses}>
        <svg className="h-5 w-5 text-indigo-500 overflow-visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          <path d="M13 2L3 14h9l-1 8" className="opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:stroke-white" strokeDasharray="20" strokeDashoffset="20" />
        </svg>
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      <svg className="h-5 w-5 text-indigo-500 overflow-visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1 0-4.88 2.5 2.5 0 0 1 0-4.88A2.5 2.5 0 0 1 9.5 2z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 0-4.88 2.5 2.5 0 0 0 0-4.88A2.5 2.5 0 0 0 14.5 2z" />
        <circle cx="12" cy="12" r="1" className="opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-300" fill="currentColor" />
      </svg>
    </div>
  );
};

export const AIExperience = () => {
  const highlights = [
    { title: "Multi-provider AI", desc: "Routes to the fastest, most reliable model — automatically." },
    { title: "Streaming responses", desc: "Watch your narrative expand in real-time when invoked." },
    { title: "On-Demand Intelligence", desc: "Iris stays silent until invited. Select text to refine or continue your thought." },
  ];

  return (
    <section id="ai" className="relative py-24 md:py-32 overflow-hidden z-20 border-t border-white/5 bg-[#050505]">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left: copy + bullets */}
          <FadeIn>
            <div>
              <span className="inline-block text-xs font-medium tracking-widest text-indigo-500 uppercase mb-3">
                The AI Experience
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                An assistant that actually <span className="gradient-text">gets you</span>
              </h2>
              <p className="mt-5 text-stone-400 text-base sm:text-lg leading-relaxed">
                Iris helps you understand complex topics and notes with surgical efficiency. 
                From real-time research to generating visual diagrams, it provides the depth you need to master any subject instantly.
              </p>

              <div className="mt-10 space-y-8">
                {highlights.map((h) => (
                  <div key={h.title} className="flex items-start gap-5 group cursor-default">
                    <HighlightIcon title={h.title} />
                    <div>
                      <h3 className="text-lg font-bold text-white transition-colors group-hover:text-indigo-400">{h.title}</h3>
                      <p className="text-sm text-stone-400 leading-relaxed font-medium">{h.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Right: editor/chat preview */}
          <FadeIn delay={200} className="relative">
            <div className="absolute -inset-10 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
            <EditorPreview />
          </FadeIn>
        </div>
      </div>
    </section>
  );
};
