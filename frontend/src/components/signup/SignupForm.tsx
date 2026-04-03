import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import Google from "../../assets/google.svg";
import { toast } from "sonner";

const SignupForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const nav = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/users/register", { name, email, password });
      if (res.data) {
        setAuth(
          {
            id: res.data.user._id || res.data.user.id,
            name: res.data.user.name,
            email: res.data.user.email,
            avatar: res.data.user.avatar,
          },
          res.data.accessToken
        );
        toast.success(`Welcome to Notesify, ${res.data.user.name}! 🎉`);
        nav("/");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/users/google`;
  };

  return (
    <div className="relative flex w-full flex-col justify-center">
      <div className="relative mx-auto w-full max-w-md">
        {/* Logo & Header */}
        <div className="mb-8 flex flex-col items-start gap-4 text-left [@media(max-height:800px)]:mb-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-white/10 blur-[30px] scale-110" />
            <img
              src="/notesify-favicon.png"
              alt="Notesify"
              width={56}
              height={56}
              className="relative rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">Create account</h1>
            <p className="text-sm text-zinc-200">Join the minimalist workspace for your <span className="text-white">ideas</span>.</p>
          </div>
        </div>

        {/* Translucent Obsidian Glass Card */}
        <div className="group auth-card-group">
          <div className="auth-card-border" />

          <div className="auth-card [@media(max-height:800px)]:p-6">
            <form onSubmit={handleRegister} className="space-y-5 [@media(max-height:800px)]:space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-300 ml-1">Full Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  className="h-12 border-white/10 bg-white/[0.03] text-white placeholder:text-zinc-500 focus-visible:border-white/30 focus-visible:ring-white/5 transition-all duration-300 [@media(max-height:800px)]:h-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-300 ml-1">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="h-12 border-white/10 bg-white/[0.03] text-white placeholder:text-zinc-500 focus-visible:border-white/30 focus-visible:ring-white/5 transition-all duration-300 [@media(max-height:800px)]:h-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-300 ml-1">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    className="h-12 border-white/10 bg-white/[0.03] pr-12 text-white placeholder:text-zinc-500 focus-visible:border-white/30 focus-visible:ring-white/5 transition-all duration-300 [@media(max-height:800px)]:h-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                variant="ghost"
                className="auth-primary-button auth-gradient-hover mt-2 h-12 w-full [@media(max-height:800px)]:h-10 active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                    Creating account…
                  </span>
                ) : (
                  "Get Started"
                )}
              </Button>

              {/* Divider */}
              <div className="relative flex items-center gap-4 py-1 [@media(max-height:800px)]:py-0.5">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">or</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>

              {/* Google */}
              <Button
                type="button"
                onClick={handleGoogleSignup}
                variant="outline"
                className="auth-google-button auth-gradient-hover group relative h-12 w-full cursor-pointer overflow-hidden border-white/10 bg-gradient-to-r from-white/[0.03] via-indigo-400/10 to-white/[0.03] font-semibold text-white hover:border-white/20 active:scale-[0.98] [@media(max-height:800px)]:h-10"
              >
                <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
                <span className="relative flex items-center justify-center gap-3">
                  <img src={Google} alt="Google" width={18} height={18} />
                  Continue with Google
                </span>
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/5 text-center [@media(max-height:800px)]:mt-4 [@media(max-height:800px)]:pt-4">
              <p className="text-sm text-zinc-400">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-white transition-all hover:underline decoration-white/30 underline-offset-4">
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col items-center gap-4 text-left [@media(max-height:800px)]:mt-4">
          <p className="text-sm text-zinc-200 max-w-[380px] leading-relaxed">
            By signing up, you agree to our <span className=" transition-colors text-[#818cf8] font-semibold hover:text-indigo-400 cursor-pointer">Terms</span> and <span className=" transition-colors text-[#818cf8] font-semibold hover:text-indigo-400 cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
