import { FadeIn } from '../ui/FadeIn';
import { Send } from 'lucide-react';

export const Newsletter = () => {
  return (
    <section className="relative py-24 z-20 border-t border-white/5 bg-[#050505]">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto glass-card p-8 md:p-12 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <FadeIn>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Stay in the loop.</h3>
                <p className="text-stone-400">
                  Get notified about new features, research updates, and the occasional writing tip. No spam, ever.
                </p>
              </FadeIn>
            </div>
            
            <div className="w-full md:w-auto">
              <FadeIn delay={200}>
                <div className="flex flex-col sm:flex-row items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 focus-within:border-indigo-500/50 transition-all">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-stone-500 outline-none"
                  />
                  <button className="group relative w-full sm:w-auto bg-white text-black hover:bg-stone-200 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300">
                    <span className="flex items-center justify-center gap-2">
                      Subscribe
                      <Send className="size-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </span>
                  </button>
                </div>
                <p className="mt-3 text-[10px] text-center md:text-left text-stone-600">
                  By subscribing, you agree to our privacy policy.
                </p>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
