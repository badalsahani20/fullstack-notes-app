import { FadeIn } from '../ui/FadeIn';
import { Code, Table, Type, Layout, Sparkles } from 'lucide-react';
import editorPreview from '../../assets/editor-preview.png';

export const EditorCapabilities = () => {
  const capabilities = [
    {
      title: "Real-Time Code Awareness",
      desc: "Automatic syntax detection and formatting as you type — no setup required.",
      icon: Code,
    },
    {
      title: "Structure-Preserving Tables",
      desc: "Native markdown tables that stay clean, readable, and easy to edit.",
      icon: Table,
    },
    {
      title: "Essential Formatting Tools",
      desc: "Essential formatting tools designed to stay out of your way.",
      icon: Type,
    },
    {
      title: "Smart Content Pasting",
      desc: "Paste from anywhere — formatting, headings, and structure stay intact.",
      icon: Layout,
    },
    {
      title: "Visual Priority System",
      desc: "Highlight and organize ideas with clarity — not clutter.",
      icon: Type,
    },
    {
      title: "Automatic Title Intelligence",
      desc: "Iris generates meaningful titles so your notes stay organized effortlessly.",
      icon: Sparkles,
    }
  ];

  return (
    <section className="relative py-24 md:py-32 z-20 bg-[#050505] overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <FadeIn>
              <span className="inline-block text-xs font-medium tracking-widest text-indigo-500 uppercase mb-3">
                The Foundation
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
                A precision tool for <br />
                <span className="gradient-text">focused writing.</span>
              </h2>
              <p className="text-stone-400 text-base sm:text-lg mb-10 max-w-xl">
                Built for precision — fast, predictable, and designed to stay out of your way.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-8">
                {capabilities.map((cap) => (
                  <div key={cap.title} className="group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                        <cap.icon className="h-4 w-4 text-indigo-400" />
                      </div>
                      <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{cap.title}</h3>
                    </div>
                    <p className="text-sm text-stone-500 leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          <div className="w-full lg:w-1/2 relative">
            <FadeIn delay={200} className="relative">
              {/* Premium Screenshot Frame */}
              <div className="relative rounded-2xl border border-white/10 bg-white/5 p-1 shadow-2xl shadow-indigo-500/10 backdrop-blur-3xl group transition-all duration-500 ease-out hover:-translate-y-2 will-change-transform">
                {/* Optimized Glow: Static blur, animate opacity */}
                <div className="absolute -inset-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-40 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-[#0a0a0a] border border-white/5">
                  <img 
                    src={editorPreview} 
                    alt="Notesify Editor Preview" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01] will-change-transform"
                  />
                  
                  {/* Static reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-30"></div>
                </div>
                
                {/* Decorative floating bits - Static animations to save CPU */}
                <div className="absolute -top-6 -right-6 h-24 w-24 bg-indigo-500/10 blur-3xl rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-purple-500/10 blur-3xl rounded-full"></div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
};
