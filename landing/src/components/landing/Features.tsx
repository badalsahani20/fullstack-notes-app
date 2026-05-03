import { FadeIn } from '../ui/FadeIn';

const FeatureIcon = ({ title, accent }: { title: string; accent: string }) => {
  const baseClasses = `relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${accent} shadow-glow mb-5 transition-all duration-300 group-hover:scale-110`;

  if (title === "Agentic AI (Iris)") {
    return (
      <div className="relative mb-5 group">
        <div className="iris-shape"></div>
      </div>
    );
  }

  if (title === "Smart Routing Engine") {
    return (
      <div className="relative mb-5 group">
        <div className="router w-12 h-12 relative">
          <div className="path-line"></div>
          <div className="branch-left"></div>
          <div className="branch-right"></div>
          <div className="pulse-dot"></div>
        </div>
      </div>
    );
  }

  if (title === "Real-Time Knowledge Access") {
    return (
      <div className="relative mb-5 group h-12 w-12 overflow-visible">
        <div className="network-container">
          <div className="node-point"></div>
          <div className="node-point"></div>
          <div className="node-point"></div>
          <div className="node-point"></div>
          <div className="conn-line conn-line-1"></div>
          <div className="conn-line conn-line-2"></div>
          <div className="conn-line conn-line-3"></div>
          <div className="pulse-intelligence"></div>
        </div>
      </div>
    );
  }

  if (title === "AI-Native Editor") {
    return (
      <div className="relative mb-5 group h-12 flex items-center overflow-hidden">
        <div className="editor-text px-3 py-2 rounded-lg bg-white/5 border border-white/10 w-full">
          <div className="selection-box">
             <div className="selection-line"></div>
             <div className="selection-line selection-line-delayed"></div>
             <div className="action-menu">ASK IRIS</div>
          </div>
        </div>
      </div>
    );
  }

  if (title === "Production-Grade Sharing") {
    return (
      <div className={baseClasses}>
        <svg className="h-6 w-6 text-white overflow-visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" className="transition-all duration-300 group-hover:stroke-dashoffset-0" strokeDasharray="10" strokeDashoffset="10" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" className="transition-all duration-300 group-hover:stroke-dashoffset-0" strokeDasharray="10" strokeDashoffset="10" />
        </svg>
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      <svg className="h-6 w-6 text-white overflow-visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        <path d="M12 11v6m-3-3h6" className="transition-all duration-300 group-hover:rotate-90 origin-center" />
      </svg>
    </div>
  );
};

export const Features = () => {
  const features = [
    {
      title: "Agentic AI (Iris)",
      desc: "Not just a chatbot — Iris decides when it needs fresh data, searches the web, and answers with real context instead of guessing.",
      accent: "from-indigo-500 to-purple-500",
    },
    {
      title: "Smart Routing Engine",
      desc: "A built-in 'Skeptical Router' decides whether to use AI, fetch live data, or stay local — optimizing both speed and cost.",
      accent: "from-purple-500 to-indigo-500",
    },
    {
      title: "Real-Time Knowledge Access",
      desc: "Ask about anything — Iris can browse documentation, crawl URLs, and bring back clean, usable answers instantly.",
      accent: "from-indigo-400 to-blue-500",
    },
    {
      title: "AI-Native Editor",
      desc: "A focused space for your thoughts. Invoke Iris only when you need it — select text to refine, expand, or continue your narrative.",
      accent: "from-blue-500 to-indigo-500",
    },
    {
      title: "Production-Grade Sharing",
      desc: "Secure, cached, and scalable note sharing with self-expiring links and instant global access.",
      accent: "from-indigo-500 to-rose-500",
    },
    {
      title: "Scales With Your Thinking",
      desc: "From quick notes to deep knowledge systems — folders, search, and structure that grow with you.",
      accent: "from-purple-500 to-indigo-500",
    },
  ];

  return (
    <section id="features" className="relative py-24 md:py-32 z-20 bg-[#050505]">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-14 md:mb-20">
          <FadeIn>
            <span className="inline-block text-xs font-medium tracking-widest text-indigo-500 uppercase mb-3">
              Core Features
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              Where writing meets <span className="gradient-text">real-time intelligence</span>
            </h2>
            <p className="mt-4 text-stone-400 text-base sm:text-lg">
              A focused set of tools that get out of the way — so writing feels effortless.
            </p>
          </FadeIn>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 100}>
              <div className="glass-card glass-card-hover p-8 group h-full flex flex-col transition-all duration-500 hover:translate-y-[-4px]">
                <FeatureIcon title={f.title} accent={f.accent} />
                <h3 className="text-xl font-bold mb-3 text-white transition-colors group-hover:text-indigo-400">{f.title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed font-medium">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
