import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Database, UserCheck, Eye, HelpCircle } from "lucide-react";
import { Header } from "../components/landing/Header";
import { Footer } from "../components/landing/Footer";

export const PrivacyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-stone-200 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
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

          {/* Page Title Header */}
          <div className="mb-12">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-sm">
              <Shield size={28} />
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl mb-4">
              Privacy Policy
            </h1>
            <p className="text-stone-400 text-base">
              Last Updated: May 26, 2026. Your privacy and data security are core priorities in everything we build.
            </p>
          </div>

          {/* Legal Text Content Card */}
          <div className="bg-[#0c0c0e]/80 border border-white/5 rounded-3xl p-6 sm:p-10 backdrop-blur-md shadow-xl space-y-10 leading-relaxed text-stone-300">
            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <Eye size={20} className="text-indigo-400" />
                1. Information We Collect
              </h2>
              <p>
                We collect personal information necessary to deliver, authenticate, synchronize, and support your workspace on Notesify.
              </p>
              
              <div className="space-y-3 mt-4">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <p className="font-semibold text-white flex items-center gap-2">
                    <UserCheck size={16} className="text-indigo-400" />
                    Google Account Profile Data (OAuth)
                  </p>
                  <p className="text-stone-400 mt-1 text-sm">
                    If you choose to sign up or log in using Google OAuth services, we access and store your <span className="text-white">email address</span>, <span className="text-white">full name</span>, and <span className="text-white">profile picture URL (avatar)</span>. This data is collected strictly to establish your secure user account and display your profile card inside the editor. We do not access contacts, calendar events, or other private Google account resources.
                  </p>
                </div>

                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <p className="font-semibold text-white flex items-center gap-2">
                    <Database size={16} className="text-indigo-400" />
                    User Created Content
                  </p>
                  <p className="text-stone-400 mt-1 text-sm">
                    We collect and store your note drafts, rich text entries, folder structures, tags, flashcards, study sessions, and images you upload directly inside the TipTap editor to sync them across your devices.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <Database size={20} className="text-indigo-400" />
                2. How We Store and Protect Your Data
              </h2>
              <p>
                Your security is at the core of Notesify. We deploy enterprise-grade infrastructure to host and guard your information:
              </p>
              <ul className="list-disc list-inside pl-2 space-y-2 text-stone-400 text-sm">
                <li>
                  <strong className="text-white">Primary Databases:</strong> Hosted securely inside MongoDB Atlas cloud servers with strict network access control lists and rest-encryption.
                </li>
                <li>
                  <strong className="text-white">Caching & Session Stores:</strong> Upstash Redis handles secure token state storage, short-lived temp codes, and active connection synchronization.
                </li>
                <li>
                  <strong className="text-white">Assets Hosting:</strong> Inserted images inside the notes workspace are hosted securely via Cloudinary services.
                </li>
                <li>
                  <strong className="text-white">Cookies:</strong> Session persistence is handled by secure cookies transmitted using `HttpOnly`, `SameSite=None`, and `Secure` attributes to prevent Cross-Site Scripting (XSS) and CSRF attacks.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <Shield size={20} className="text-indigo-400" />
                3. Third-Party Services and AI Integration
              </h2>
              <p>
                We do not sell, rent, or trade your personal data or note content to any third parties. To supply specific app features, we securely exchange details with verified service providers:
              </p>
              <div className="p-4 bg-indigo-950/20 border border-indigo-500/10 rounded-2xl">
                <p className="font-semibold text-white mb-2">Google Gemini AI Integrations:</p>
                <p className="text-sm text-stone-300">
                  When you select text and ask our AI companion ("Iris") to explain, outline, or format concepts, selected sections of your notes are securely sent to Google Gemini APIs to compile responses. These payloads are used exclusively for real-time inference during your active workspace sessions and <span className="text-indigo-400 font-bold">are not used to train generic foundation models</span> without your explicit permission.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <UserCheck size={20} className="text-indigo-400" />
                4. User Control & Data Retention
              </h2>
              <p>
                You retain ultimate authority over your digital presence on Notesify:
              </p>
              <ul className="list-disc list-inside pl-2 space-y-2">
                <li>You can access, modify, download, and delete any specific notes or files directly in the editor.</li>
                <li>You have the right to permanently close and delete your entire account by requesting account termination at badalsahani233@gmail.com, which completely purges your associated data records from our active databases.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <HelpCircle size={20} className="text-indigo-400" />
                5. Contact and Queries
              </h2>
              <p>
                If you have any questions about this Privacy Policy, your personal data storage, or wish to request data erasure/erasure confirmation, please reach out to us at:
              </p>
              <p className="p-4 bg-white/5 border border-white/5 rounded-2xl font-mono text-center text-white text-sm">
                badalsahani233@gmail.com
              </p>
            </section>

            {/* Footer Notice */}
            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 gap-4 text-center sm:text-left">
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
