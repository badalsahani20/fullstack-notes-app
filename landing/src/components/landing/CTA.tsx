import { ArrowRight } from 'lucide-react';
import { FadeIn } from '../ui/FadeIn';

export const CTA = () => {
  return (
    <section className="relative py-24 md:py-32 z-20 overflow-hidden">
      <div className="container mx-auto px-6">
        <FadeIn className="relative max-w-3xl mx-auto text-center">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-full blur-[100px]" />
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-60 w-[600px] bg-indigo-600/20 blur-[120px] rounded-full -z-10" />

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
            Stop losing your <span className="gradient-text">half-thoughts.</span>
          </h2>
          <p className="mt-5 text-stone-400 text-base sm:text-lg max-w-xl mx-auto">
            Open Notesify, write the first line, and let Iris carry it the rest of the way.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4">
            <a 
              href="https://app.notesify.in"
              className="group relative flex items-center justify-center bg-white text-black hover:bg-stone-200 px-10 py-5 rounded-2xl text-base sm:text-lg font-bold transition-all duration-300 w-full sm:w-auto active:scale-95 shadow-2xl shadow-white/10 overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                <span className="transition-transform duration-300 group-hover:-translate-x-1">Start writing free</span>
                <div className="relative ml-2 size-5 overflow-hidden">
                  <ArrowRight className="absolute inset-0 size-full transition duration-300 group-hover:translate-x-full group-hover:opacity-0 group-hover:blur-sm" />
                  <ArrowRight className="absolute inset-0 size-full -translate-x-full opacity-0 blur-sm transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-hover:blur-none group-hover:delay-75" />
                </div>
              </span>
            </a>
            <p className="text-xs text-stone-500">
              Free forever · No credit card · Sign in with Google
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
