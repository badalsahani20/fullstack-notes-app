import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import Google from "../assets/google.svg";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const nav = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/users/login", { email, password });
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
        nav("/");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/users/google`;
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black p-4">
      {/* Dynamic Background Elements */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Premium Moving Dark Theme Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-80">
        <div className="absolute -left-[50%] -top-[50%] h-[200%] w-[200%] animate-[spin_25s_linear_infinite]">
          {/* Subtle slow moving white & indigo blurs */}
          <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-white/5 blur-[120px]" />
          <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[100px]" />
          <div className="absolute bottom-1/3 left-1/3 h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-[120px]" />
        </div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-white/10 blur-[30px] scale-110" />
            <img
              src="/notesify-favicon.png"
              alt="Notesify"
              width={64}
              height={64}
              className="relative rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
            <p className="text-sm text-zinc-500">The minimalist way to organize your thoughts.</p>
          </div>
        </div>

        {/* Translucent Obsidian Glass Card */}
        <div className="group relative z-10">
          <div className="absolute -inset-[1px] rounded-[21px] bg-gradient-to-b from-white/15 via-transparent to-white/5 opacity-50 transition-opacity duration-500 group-hover:opacity-100" />
          
          <div className="relative rounded-2xl bg-white/[0.02] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_32px_100px_rgba(0,0,0,0.8)] backdrop-blur-[40px] border border-white/[0.08]">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 ml-1">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="h-12 border-white/10 bg-white/[0.03] text-white placeholder:text-zinc-700 focus-visible:border-white/30 focus-visible:ring-white/5 transition-all duration-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Password</label>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 border-white/10 bg-white/[0.03] pr-12 text-white placeholder:text-zinc-700 focus-visible:border-white/30 focus-visible:ring-white/5 transition-all duration-300"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-zinc-500 transition-colors hover:text-white"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit - Pure Premium White */}
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full bg-[#818cf8] font-bold text-black hover:bg-zinc-200 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                    Authenticating…
                  </span>
                ) : (
                  "Continue"
                )}
              </Button>

              {/* Divider */}
              <div className="relative flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-700">security</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>

              {/* Google */}
              <Button
                type="button"
                onClick={handleGoogleLogin}
                variant="outline"
                className="group relative h-12 w-full cursor-pointer overflow-hidden border-white/10 bg-white/[0.03] font-semibold text-white transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] active:scale-[0.98]"
              >
                <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
                <span className="relative flex items-center justify-center gap-3">
                  <img src={Google} alt="Google" width={18} height={18} />
                  Continue with Google
                </span>
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-sm text-zinc-500">
                New to Notesify?{" "}
                <Link to="/register" className="font-semibold text-white transition-all hover:underline decoration-white/30 underline-offset-4">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col items-center gap-4 text-center">
          <p className="text-[10px] text-zinc-600 max-w-[280px] leading-relaxed">
            By continuing, you agree to our <span className="text-zinc-500 transition-colors hover:text-zinc-400 cursor-pointer">Terms</span> and <span className="text-zinc-500 transition-colors hover:text-zinc-400 cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;




