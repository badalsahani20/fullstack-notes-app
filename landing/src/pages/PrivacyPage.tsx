import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Header } from "../components/landing/Header";
import { Footer } from "../components/landing/Footer";
import privacyContent from './notesify-privacy.md?raw';
import { SEO } from "../components/landing/SEO";

export const PrivacyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-stone-200 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      <SEO 
        title="Privacy Policy — Notesify"
        description="Read the Privacy Policy for Notesify. Learn how we collect, store, use, and protect your note data and account information."
        keywords="notesify privacy policy, privacy, notesify data security"
        path="/privacy"
      />
      <Header />

      <main className="relative z-10 pt-28 pb-16">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 max-w-4xl">
          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition-colors mb-8 group text-sm font-medium"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Home
          </Link>

          {/* Legal Text Content Card */}
          <div className="bg-[#0c0c0e]/80 border border-white/5 rounded-3xl p-8 sm:p-12 backdrop-blur-md shadow-xl text-stone-300">
            <article className="prose prose-invert prose-indigo max-w-none prose-headings:text-white prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-hr:border-white/5">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({node, href, ...props}) => {
                    const isExternal = href?.startsWith('http') || href?.startsWith('mailto');
                    return (
                      <a 
                        href={href} 
                        target={isExternal ? "_blank" : undefined} 
                        rel={isExternal ? "noopener noreferrer" : undefined} 
                        {...props} 
                      />
                    );
                  }
                }}
              >
                {privacyContent}
              </ReactMarkdown>
            </article>

            {/* Footer Notice */}
            <div className="pt-6 mt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 gap-4 text-center sm:text-left">
              <p>© {new Date().getFullYear()} Notesify. All privacy protections fully operational.</p>
              <Link to="/terms" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
                View Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
