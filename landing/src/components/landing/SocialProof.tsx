import { Star, Users } from 'lucide-react';

export const SocialProof = () => {
  
  return (
    <section className="relative py-12 z-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            <div className="group flex items-center gap-2 cursor-default">
              <div className="flex">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 fill-indigo-500 text-indigo-500 transition-all duration-300 group-hover:scale-125`}
                    style={{ transitionDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-white transition-colors group-hover:text-indigo-400">4.9/5</span>
              <span className="text-xs text-stone-400">from early users</span>
            </div>

            <div className="hidden sm:block h-5 w-px bg-white/20" />

            <div className="group flex items-center gap-2 text-sm text-stone-300 cursor-default">
              <div className="relative">
                <Users className="h-4 w-4 text-emerald-500 transition-all duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="font-medium text-white transition-colors group-hover:text-emerald-400">First 500+</span>
              <span className="text-stone-400">Early Adopters</span>
            </div>

            <div className="hidden sm:block h-5 w-px bg-white/20" />

            <div className="group flex items-center gap-2 text-sm text-stone-300 cursor-default">
              <div className="relative size-5">
                <div className="absolute inset-0 bg-indigo-500 iris-mini-blob transition-all duration-500 group-hover:bg-white group-hover:rotate-180"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="size-1 rounded-full bg-white group-hover:bg-indigo-500 transition-colors"></div>
                </div>
                <div className="absolute inset-0 bg-indigo-500/30 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="text-stone-400 transition-colors group-hover:text-indigo-400 font-medium">DeepSeek-v4 Powered</span>
            </div>
          </div>

          {/* <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] tracking-widest text-emerald-400 uppercase font-bold">
                Alpha Access Live
              </span>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
};
