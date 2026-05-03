import { Mail } from 'lucide-react';
import { FaGithub, FaXTwitter } from 'react-icons/fa6';

export const Footer = () => {
  return (
    <footer className="relative border-t border-white/10 py-12 mt-12 bg-[#020202] z-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 group">
              <img src="/favicon.png" alt="Notesify" width={32} height={32} className="group-hover:scale-110 transition-transform duration-300" />
              <span className="font-semibold tracking-tight text-lg text-white">Notesify</span>
            </a>
            <p className="mt-4 text-sm text-stone-400 max-w-sm">
              The AI-powered note-taking app for people who think fast and write often.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a href="#" aria-label="GitHub" className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-stone-400 hover:text-white hover:border-indigo-500/50 transition-colors">
                <FaGithub className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Twitter" className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-stone-400 hover:text-white hover:border-indigo-500/50 transition-colors">
                <FaXTwitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Email" className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-stone-400 hover:text-white hover:border-indigo-500/50 transition-colors">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="#ai" className="hover:text-indigo-400 transition-colors">AI Experience</a></li>
              <li><a href="#roadmap" className="hover:text-indigo-400 transition-colors">Roadmap</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Performance</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-white">Tech Stack</h4>
            <ul className="space-y-3 text-sm text-stone-400 font-mono">
              <li>React 18</li>
              <li>Node.js</li>
              <li>MongoDB</li>
              <li>Upstash Redis</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <span>© {new Date().getFullYear()} Notesify. Crafted with care.</span>
          <span>Designed for thinkers · Built for speed</span>
        </div>
      </div>
    </footer>
  );
};
