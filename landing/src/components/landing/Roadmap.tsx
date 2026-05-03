import { Users, GitBranch, MessagesSquare } from 'lucide-react';
import { FadeIn } from '../ui/FadeIn';

export const Roadmap = () => {
  const items = [
    {
      icon: Users,
      title: "Real-time collaborative editing",
      desc: "Work alongside your team in the same note — like Google Docs, but faster and more focused.",
    },
    {
      icon: GitBranch,
      title: "Multi-user live editing",
      desc: "Smart conflict handling means edits never collide, even with dozens of cursors moving at once.",
    },
    {
      icon: MessagesSquare,
      title: "Inline comments & threads",
      desc: "Discuss ideas exactly where they live — no more context switching to chat apps.",
    },
  ];

  return (
    <section id="roadmap" className="relative py-24 md:py-32 z-20 border-t border-white/5">
      <div className="container mx-auto px-6">
        <FadeIn className="max-w-2xl mx-auto text-center mb-14">
          <span className="inline-block text-xs font-medium tracking-widest text-indigo-500 uppercase mb-3">
            What's Next
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Coming soon to <span className="gradient-text">Notesify</span>
          </h2>
          <p className="mt-4 text-stone-400 text-base sm:text-lg">
            We're shipping fast. Here's a peek at what's landing next.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {items.map((item, i) => (
            <FadeIn key={item.title} delay={i * 100}>
              <div className="glass-card p-6 relative overflow-hidden h-full">
                <span className="absolute top-4 right-4 inline-flex items-center rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-indigo-400 uppercase">
                  Coming soon
                </span>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 mb-4">
                  <item.icon className="h-5 w-5 text-indigo-500" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed">{item.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
