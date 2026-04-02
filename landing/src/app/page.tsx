import DarkVeil from "./components/DarkVeil";

const APP_URL = "https://notesify-eta.vercel.app";

const features = [
  {
    icon: "🤖",
    title: "AI-Powered Assistant",
    description:
      "Ask questions, summarize notes, brainstorm ideas, and rewrite content — powered by streaming AI built right into your workspace.",
  },
  {
    icon: "✍️",
    title: "Rich Text Editor",
    description:
      "A beautiful TipTap-powered editor with markdown shortcuts, tables, headings, and drag-and-drop image uploads via Cloudinary.",
  },
  {
    icon: "📂",
    title: "Smart Folders",
    description:
      "Organize notes into nested folders with an expandable sidebar tree. Drag and drop notes between folders effortlessly.",
  },
  {
    icon: "⚡",
    title: "Instant Sync",
    description:
      "Optimistic UI updates powered by React Query and Redis caching. Every action feels instant — no loading spinners.",
  },
  {
    icon: "🔒",
    title: "Secure Authentication",
    description:
      "Sign in with email or Google OAuth. JWT-based sessions with automatic token rotation and secure password reset via email.",
  },
  {
    icon: "⭐",
    title: "Favorites & Archive",
    description:
      "Star important notes to pin them. Archive what you don't need right now. Soft-delete to trash with easy restore.",
  },
];

const highlights = [
  {
    icon: "💬",
    label: "Streaming AI Chat",
    description: "Real-time streaming responses with context-aware conversations per note.",
  },
  {
    icon: "🎯",
    label: "Quick Actions",
    description: "One-click Summarize, Improve, Brainstorm, and Rewrite — no prompts needed.",
  },
  {
    icon: "📝",
    label: "Selection-Aware",
    description: "Highlight text and ask the AI about it. It understands your note context.",
  },
  {
    icon: "💾",
    label: "Persistent History",
    description: "Chat history is saved per note. Pick up conversations right where you left off.",
  },
];

export default function LandingPage() {
  return (
    <main id="main-content">
      {/* ═══════════ NAVBAR ═══════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050507]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#" className="text-xl font-bold tracking-tight text-white">
            Notesify
          </a>
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              Features
            </a>
            <a
              href="#ai"
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              AI Assistant
            </a>
            <a
              href="#editor"
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              Editor
            </a>
          </div>
          <a href={`${APP_URL}/register`} className="btn-primary !py-2.5 !px-5 !text-sm">
            <span>Get Started</span>
          </a>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
        {/* Dark Veil Background */}
        <div className="absolute inset-0 opacity-40">
          <DarkVeil
            speed={0.3}
            hueShift={200}
            noiseIntensity={0.03}
            warpAmount={0.4}
            resolutionScale={0.6}
          />
        </div>

        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050507] via-transparent to-[#050507]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#050507_80%)]" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          {/* Badge */}
          <div className="animate-fade-in-up mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            Now with AI-Powered Assistant
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up delay-100 text-5xl font-extrabold leading-tight tracking-tight text-balance sm:text-6xl md:text-7xl">
            <span className="gradient-text">Notes, supercharged</span>
            <br />
            <span className="text-white">with AI.</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up delay-200 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            Capture your ideas in a beautiful rich-text editor, organize them
            with smart folders, and let AI help you think faster. All in one
            workspace.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up delay-300 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={`${APP_URL}/register`} className="btn-primary text-base">
              <span>Sign Up Free →</span>
            </a>
            <a href="#features" className="btn-secondary text-base">
              Explore Features
            </a>
          </div>

          {/* Trust line */}
          <p className="animate-fade-in delay-500 mt-8 text-sm text-zinc-500">
            Free forever · No credit card · Sign up with Google or Email
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in delay-700">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-zinc-500">Scroll</span>
            <div className="h-8 w-[1px] bg-gradient-to-b from-zinc-500 to-transparent" />
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section
        id="features"
        className="relative py-32 scroll-mt-28"
      >
        <div className="mx-auto max-w-6xl px-6">
          {/* Section header */}
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block text-sm font-medium uppercase tracking-widest text-violet-400">
              Features
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Everything you need,
              <br />
              <span className="gradient-text">nothing you don&apos;t.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-400">
              Built for speed, designed for clarity. Every feature is crafted to
              help you focus on what matters — your ideas.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <article
                key={feature.title}
                className="glass-card p-8"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-2xl">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══════════ AI SHOWCASE ═══════════ */}
      <section id="ai" className="relative py-32 scroll-mt-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left — Text */}
            <div>
              <span className="mb-4 inline-block text-sm font-medium uppercase tracking-widest text-violet-400">
                AI Assistant
              </span>
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Your personal
                <br />
                <span className="gradient-text">thinking partner.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-zinc-400">
                Ask questions about your notes, get instant summaries, brainstorm
                new ideas, or rewrite paragraphs — all without leaving your
                editor. Powered by streaming AI that responds in real time.
              </p>

              {/* Highlight cards */}
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {highlights.map((h) => (
                  <div
                    key={h.label}
                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4"
                  >
                    <span className="mt-0.5 text-xl">{h.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {h.label}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                        {h.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Mock AI Chat */}
            <div className="relative">
              <div className="glass-card overflow-hidden p-0">
                {/* Chat header */}
                <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
                  <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
                  <span className="text-sm font-medium text-zinc-300">
                    AI Assistant
                  </span>
                </div>

                {/* Chat messages */}
                <div className="space-y-4 p-6">
                  {/* User message */}
                  <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-violet-600/20 px-4 py-3 text-sm text-zinc-200">
                    Summarize the key takeaways from my Data Structures notes
                  </div>

                  {/* AI response */}
                  <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/5 px-4 py-3 text-sm leading-relaxed text-zinc-300">
                    <p className="mb-2">
                      Here are the key takeaways from your notes:
                    </p>
                    <ul className="space-y-1 text-zinc-400">
                      <li>
                        • <strong className="text-zinc-300">Arrays</strong> — O(1) access, O(n) insertion
                      </li>
                      <li>
                        • <strong className="text-zinc-300">Linked Lists</strong> — O(1) insertion, O(n) search
                      </li>
                      <li>
                        • <strong className="text-zinc-300">Hash Maps</strong> — O(1) average lookup
                      </li>
                      <li>
                        • <strong className="text-zinc-300">Trees</strong> — O(log n) search with balanced BST
                      </li>
                    </ul>
                  </div>

                  {/* Quick actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["Expand on this", "Quiz me", "Create flashcards"].map(
                      (action) => (
                        <span
                          key={action}
                          className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300 transition hover:bg-violet-500/20"
                        >
                          {action}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Glow effect behind card */}
              <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-violet-500/10 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══════════ EDITOR SHOWCASE ═══════════ */}
      <section id="editor" className="relative py-32 scroll-mt-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left — Mock Editor */}
            <div className="relative order-2 lg:order-1">
              <div className="glass-card overflow-hidden p-0">
                {/* Title bar */}
                <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/60" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                    <div className="h-3 w-3 rounded-full bg-green-500/60" />
                  </div>
                  <span className="ml-3 text-sm text-zinc-500">
                    Project Ideas.md
                  </span>
                </div>

                {/* Editor content */}
                <div className="p-6 font-mono">
                  <h3 className="text-lg font-bold text-white">
                    # Project Ideas for Q2
                  </h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <p className="text-zinc-300">
                      Here are my top priorities for the upcoming quarter:
                    </p>
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
                        High Priority
                      </p>
                      <ul className="mt-2 space-y-1 text-zinc-400">
                        <li>✅ Redesign the dashboard UI</li>
                        <li>⬜ Implement real-time collaboration</li>
                        <li>⬜ Add export to PDF functionality</li>
                      </ul>
                    </div>
                    <p className="text-zinc-500 italic">
                      &quot;The best note-taking app is the one you actually use.&quot;
                    </p>
                  </div>
                </div>
              </div>

              {/* Glow effect */}
              <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-indigo-500/10 blur-3xl" />
            </div>

            {/* Right — Text */}
            <div className="order-1 lg:order-2">
              <span className="mb-4 inline-block text-sm font-medium uppercase tracking-widest text-violet-400">
                Editor
              </span>
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Write freely,
                <br />
                <span className="gradient-text">format beautifully.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-zinc-400">
                A distraction-free rich text editor that supports markdown
                shortcuts, tables, code blocks, and drag-and-drop images. Feels
                like Notion, but built for speed.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  {
                    icon: "⌨️",
                    text: "Markdown shortcuts — type # for headings, ** for bold",
                  },
                  {
                    icon: "🖼️",
                    text: "Drag & drop images — uploaded via Cloudinary instantly",
                  },
                  {
                    icon: "📊",
                    text: "Tables, code blocks, and rich formatting built-in",
                  },
                  {
                    icon: "💨",
                    text: "Zero lag — optimistic updates keep everything snappy",
                  },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <p className="text-sm text-zinc-400">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="relative py-32">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_70%)]" />

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to supercharge
            <br />
            <span className="gradient-text">your notes?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
            Join Notesify and start writing smarter. Sign up in seconds with
            Google or your email — it&apos;s completely free.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={`${APP_URL}/register`} className="btn-primary text-base px-10">
              <span>Get Started — It&apos;s Free</span>
            </a>
            <a
              href="https://github.com/badalsahani20/fullstack-notes-app"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-base"
            >
              ⭐ Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Notesify</span>
            <span className="text-sm text-zinc-600">
              © {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/badalsahani20/fullstack-notes-app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-500 transition hover:text-white"
            >
              GitHub
            </a>
            <span className="text-zinc-800">·</span>
            <span className="text-sm text-zinc-500">
              Built with ❤️ by Badal
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
