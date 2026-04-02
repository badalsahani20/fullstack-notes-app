import illustration from "./illustrations/dark.png";

const SignupIllustration = () => {
  return (
    <div className="relative hidden h-full w-full flex-col justify-center overflow-hidden bg-[#0a0a0a] p-12 lg:flex">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(129,140,248,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <div className="relative z-10 flex flex-col items-start gap-8">
        <div className="flex flex-col gap-3">
          <h2 className="text-4xl font-bold tracking-tight text-white">
            Your second brain, <br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              beautifully organized.
            </span>
          </h2>
          <p className="max-w-md text-lg text-zinc-400">
            Join thousands of thinkers using Notesify to capture their best ideas and build their knowledge base.
          </p>
        </div>

        <div className="group relative w-full max-w-lg transition-all duration-700 hover:scale-[1.02]">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500/20 to-violet-500/20 blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
          <div className="relative rounded-2xl border border-white/5 bg-white/[0.02] p-2 shadow-2xl backdrop-blur-sm">
            <img
              src={illustration}
              alt="Notesify Workspace"
              className="rounded-xl shadow-2xl transition-transform duration-700"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 pt-4">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-10 rounded-full border-2 border-[#0a0a0a] bg-zinc-800" />
            ))}
          </div>
          <p className="text-sm text-zinc-500">
            <span className="font-semibold text-zinc-300">New joiners</span> this week
          </p>
        </div>
      </div>

      {/* Floating accent elements */}
      <div className="absolute bottom-12 right-12 h-64 w-64 rounded-full bg-indigo-600/5 blur-[100px]" />
    </div>
  );
};

export default SignupIllustration;
