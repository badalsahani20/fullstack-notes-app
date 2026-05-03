import { Header } from './components/landing/Header';
import { Hero } from './components/landing/Hero';
import { SocialProof } from './components/landing/SocialProof';
import { Manifesto } from './components/landing/Manifesto';
import { Features } from './components/landing/Features';
import { AIExperience } from './components/landing/AIExperience';
import { EditorCapabilities } from './components/landing/EditorCapabilities';
import { IrisLiveDemo } from './components/landing/IrisLiveDemo';
import { Roadmap } from './components/landing/Roadmap';
import { CTA } from './components/landing/CTA';
import { Newsletter } from './components/landing/Newsletter';
import { Footer } from './components/landing/Footer';

function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-stone-200 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      <Header />

      <main className="relative z-10">
        <Hero />
        <SocialProof />
        <Manifesto />
        <Features />
        <AIExperience />
        <EditorCapabilities />
        
        {/* --- Iris Live Demo Section --- */}
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

        <Roadmap />
        <CTA />
        <Newsletter />
      </main>

      <Footer />
    </div>
  );
}

export default App;