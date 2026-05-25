import { useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, ArrowLeft, ShieldAlert, Key, Scale, HelpCircle } from "lucide-react";
import { Header } from "../components/landing/Header";
import { Footer } from "../components/landing/Footer";

export const TermsPage = () => {
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
              <FileText size={28} />
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl mb-4">
              Terms of Service
            </h1>
            <p className="text-stone-400 text-base">
              Last Updated: May 26, 2026. Please read these terms carefully before using Notesify.
            </p>
          </div>

          {/* Legal Text Content Card */}
          <div className="bg-[#0c0c0e]/80 border border-white/5 rounded-3xl p-6 sm:p-10 backdrop-blur-md shadow-xl space-y-10 leading-relaxed text-stone-300">
            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <Scale size={20} className="text-indigo-400" />
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using Notesify (referred to as "the Service", "we", "us", or "our"), available at{" "}
                <span className="text-white font-medium">notesify.in</span> (and associated subdomains like{" "}
                <span className="text-white font-medium">app.notesify.in</span>), you agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use the Service.
              </p>
              <p>
                We reserve the right to update, change, or replace any part of these Terms of Service at our sole discretion. We
                will post notice of updates on this page, and the date of last revision will be updated at the top.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <Key size={20} className="text-indigo-400" />
                2. Accounts and Authentication
              </h2>
              <p>
                To utilize the full features of Notesify, you must register for an account. We offer login and registration through email
                credentials and Google OAuth services.
              </p>
              <ul className="list-disc list-inside pl-2 space-y-2">
                <li>You must provide accurate and complete registration details.</li>
                <li>You are solely responsible for protecting your account credentials and maintaining security.</li>
                <li>You must immediately notify us of any unauthorized use or security breaches of your account.</li>
                <li>We reserve the right to terminate accounts that violate security policies or engage in abusive behavior.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <FileText size={20} className="text-indigo-400" />
                3. User Content and Intellectual Property
              </h2>
              <p>
                Notesify allows you to write notes, create folders, upload images, compile flashcards, and store personal study materials
                (collectively, "User Content").
              </p>
              <div className="p-4 bg-indigo-950/20 border border-indigo-500/10 rounded-2xl">
                <p className="font-semibold text-white mb-1">Ownership rights:</p>
                <p>
                  You retain <span className="text-indigo-400 font-bold">100% ownership</span> of all User Content you create, store, or upload
                  on the platform. Notesify does not claim any proprietary rights, licenses, or ownership over your notes or study data.
                </p>
              </div>
              <p>
                You represent and warrant that your User Content does not infringe upon the copyrights, intellectual property rights, or privacy rights of any third party.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <ShieldAlert size={20} className="text-indigo-400" />
                4. AI Assistant Features ("Iris")
              </h2>
              <p>
                Notesify includes advanced artificial intelligence assistants and context-aware writing prompts ("Iris") powered by underlying Large Language Models (Gemini API).
              </p>
              <ul className="list-disc list-inside pl-2 space-y-2">
                <li>AI features are provided to help summarize, format, brainstorm, and explain note concepts for educational and organizational purposes.</li>
                <li>
                  <span className="text-white font-medium">Accuracy Disclaimer:</span> AI technology can produce outputs that are inaccurate, incomplete, or misleading ("hallucinations"). You are solely responsible for reviewing and verifying any information generated by Iris before relying on it.
                </li>
                <li>
                  You agree not to use AI components to systematically generate academic fraud, plagiarize, spread misinformation, harvest data, or generate abusive/harmful content.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <HelpCircle size={20} className="text-indigo-400" />
                5. Limitation of Liability and "As-Is" Service
              </h2>
              <p>
                The Service is provided on an "as-is" and "as available" basis without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
              </p>
              <p>
                In no event shall Notesify, its creators, or partners be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the Service, including but not limited to notes data corruption, session loss, or server interruptions.
              </p>
            </section>

            {/* Footer Notice */}
            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 gap-4 text-center sm:text-left">
              <p>For any queries regarding these Terms, contact us at badalsahani233@gmail.com.</p>
              <Link to="/privacy" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
                View Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
