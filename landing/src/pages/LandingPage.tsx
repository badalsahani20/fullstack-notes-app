import { useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import { Header } from '../components/landing/Header';
import { Hero } from '../components/landing/Hero';
import { SocialProof } from '../components/landing/SocialProof';
import appScreenshot from '../assets/app-screenshot.png';
import { Manifesto } from '../components/landing/Manifesto';
import { Features } from '../components/landing/Features';
import { AIExperience } from '../components/landing/AIExperience';
import { EditorCapabilities } from '../components/landing/EditorCapabilities';
import { IrisLiveDemo } from '../components/landing/IrisLiveDemo';
import { Roadmap } from '../components/landing/Roadmap';
import { CTA } from '../components/landing/CTA';
import { Feedback } from '../components/landing/Newsletter';
import { FAQ } from '../components/landing/FAQ';
import { Footer } from '../components/landing/Footer';
import { SEO } from '../components/landing/SEO';

export const LandingPage = () => {
  const [isScreenshotExpanded, setIsScreenshotExpanded] = useState(false);
  return (
    <div className="min-h-screen bg-[#050505] text-stone-200 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      <SEO 
        title="Notesify — AI Notes, Quizzes & Flashcards in One Study Workspace"
        description="Write notes, ask doubts, generate AI-powered quizzes, flashcards, notes, summaries, and study smarter with Notesify — a calm workspace built for focused learning."
        keywords="ai notes app, flashcards app, quiz generator, markdown notes, study app, ai study assistant, notesify"
        path="/"
      />
      <Header />

      <main className="relative z-10">
        <Hero />
        <SocialProof />

        {/* --- Product Screenshot Showcase --- */}
        <section className="relative pt-6 pb-24 z-20">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="relative group rounded-2xl border border-white/10 bg-white/[0.02] p-2 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-700 hover:border-indigo-500/30 hover:shadow-[0_0_60px_rgba(99,102,241,0.15)]">
              {/* Glow overlay */}
              <div className="absolute -inset-x-20 -top-40 h-[300px] bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full transition-opacity duration-700 opacity-60 group-hover:opacity-100" />
              
              {/* Window Controls (Mac style) */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0a0a0a]/50">
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-rose-500/80" />
                  <div className="size-2 rounded-full bg-amber-500/80" />
                  <div className="size-2 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-[10px] text-stone-500 font-mono tracking-wider">
                  app.notesify.in/notes/roadmaps
                </div>
                <div className="w-12" /> {/* spacer */}
              </div>

              {/* Image itself */}
              <div 
                className="relative aspect-[16/9] w-full overflow-hidden bg-[#0d0d0d] rounded-b-xl cursor-zoom-in group"
                onClick={() => setIsScreenshotExpanded(true)}
              >
                <img 
                  src={appScreenshot} 
                  alt="Notesify Workspace and Iris AI Assistant Interface" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.008]"
                  loading="lazy"
                />
                {/* Zoom overlay on Hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-white/10 text-white text-xs font-semibold backdrop-blur-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <Maximize2 size={14} className="text-indigo-400" />
                    <span>View Fullscreen</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Iris Preview Section --- */}
        <section className="relative py-24 bg-[#050505]/50 border-t border-white/5">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-12">
               <span className="inline-block text-xs font-medium tracking-widest text-indigo-500 uppercase mb-3">
                 Try it yourself
               </span>
               <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                 Give Iris a thought
               </h2>
               <p className="text-stone-400">See how our custom routing engine handles different queries.</p>
            </div>
            <IrisLiveDemo />
          </div>
        </section>

        <Manifesto />
        <Features />
        <AIExperience />
        <EditorCapabilities />

        <Roadmap />
        <FAQ />
        <CTA />
        <Feedback />

        {/* Fullscreen Product Screenshot Modal */}
        {isScreenshotExpanded && (
          <div 
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-md p-4 md:p-10 transition-all duration-300 cursor-zoom-out"
            onClick={() => setIsScreenshotExpanded(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setIsScreenshotExpanded(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-stone-300 hover:text-white hover:bg-white/10 transition-all z-[110] cursor-pointer"
              aria-label="Close fullscreen view"
            >
              <X size={20} />
            </button>
            
            {/* Image Wrapper */}
            <div className="relative max-w-7xl max-h-[85vh] w-full flex items-center justify-center p-2">
              <img 
                src={appScreenshot} 
                alt="Notesify Workspace and Iris AI Assistant Interface Fullscreen" 
                className="max-w-full max-h-[80vh] md:max-h-[85vh] object-contain rounded-xl border border-white/10 shadow-2xl cursor-default"
                onClick={(e) => e.stopPropagation()} // Prevent closing ONLY when clicking the image itself
              />
            </div>
            
            {/* Caption */}
            <p className="mt-4 text-xs text-stone-400 font-medium tracking-wide">
              Notesify Workspace showing document editor (left) and Iris AI Assistant with rendered Mermaid diagram (right).
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
