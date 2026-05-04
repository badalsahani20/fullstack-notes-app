import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Header } from '../components/landing/Header';
import { Footer } from '../components/landing/Footer';
import docsContent from './notesify-docs.md?raw';

export const DocsPage = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-stone-200 selection:bg-indigo-500/30 font-sans overflow-x-hidden pt-24">
      <Header />
      
      <main className="container mx-auto px-6 max-w-4xl py-12 relative z-10">
        <div className="glass-card p-8 sm:p-12">
          <article className="prose prose-invert prose-indigo max-w-none prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-white/10 prose-img:rounded-xl">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({node, href, ...props}) => {
                  const isExternal = href?.startsWith('http');
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
              {docsContent}
            </ReactMarkdown>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};
