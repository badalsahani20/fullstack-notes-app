import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import Google from "../assets/google.svg";
import { toast } from "sonner";
import Logo from "@/components/ui/Logo";

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
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#070b14] p-4">
      {/* Ambient glow + subtle grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#1f2a44_0%,transparent_55%)] opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-15" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[640px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-violet-600/10 blur-[110px]" />

      <div className="relative w-full max-w-md">
        {/* Logo mark */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo size={56} className="shadow-2xl" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-zinc-500">Sign in to continue organizing your notes.</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0f1625]/90 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">Email</label>
              <Input
                type="email"
                placeholder="name@example.com"
                className="h-11 border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">Password</label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  className="h-11 border-white/10 bg-white/5 pr-10 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className="text-[11px] font-medium text-zinc-500 transition hover:text-zinc-300"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full bg-indigo-600 font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/8" />
              <span className="text-xs text-zinc-600">or</span>
              <div className="h-px flex-1 bg-white/8" />
            </div>

            {/* Google */}
            <Button
              type="button"
              onClick={handleGoogleLogin}
              variant="outline"
              className="group relative h-11 w-full cursor-pointer overflow-hidden border-white/10 bg-white/5 font-medium text-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_12px_24px_rgba(0,0,0,0.4)] active:scale-[0.97] hover:text-white"
            >
              {/* Shine effect sweep */}
              <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
              
              <span className="relative flex items-center justify-center gap-[10px]">
                <img src={Google} alt="Google" width={18} />
                Continue with Google
              </span>
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600">
            Need an account?{" "}
            <Link to="/register" className="font-medium text-indigo-400 transition hover:text-indigo-300">
              Sign up for free
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-200">
          By signing in you agree to our{" "}
          <span className="text-zinc-200">Terms of Service</span> and{" "}
          <span className="text-zinc-200">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default Login;
