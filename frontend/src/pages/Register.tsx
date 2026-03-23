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

const Register = () => {
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
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#080d18] p-4">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-600/8 blur-[100px]" />

      <div className="relative w-full max-w-md">
        {/* Logo mark */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo size={56} className="shadow-2xl" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Create your account</h1>
            <p className="mt-1 text-sm text-zinc-500">Your workspace is one step away.</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/8 bg-[#0f1625]/90 p-8 shadow-[0_24px_64px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-widest text-zinc-500">Full name</label>
              <Input
                type="text"
                placeholder="Badal Sahani"
                className="h-11 border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500/50"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-widest text-zinc-500">Email</label>
              <Input
                type="email"
                placeholder="name@example.com"
                className="h-11 border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-widest text-zinc-500">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
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

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full bg-indigo-600 font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account…
                </span>
              ) : (
                "Get started for free"
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
              onClick={handleGoogleSignup}
              variant="outline"
              className="h-11 w-full border-white/10 bg-white/5 font-medium text-white hover:bg-white/10"
            >
              <img src={Google} alt="Google" width={18} className="mr-2" />
              Continue with Google
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-indigo-400 transition hover:text-indigo-300">
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-zinc-700">
          By signing up you agree to our{" "}
          <span className="text-zinc-500">Terms of Service</span> and{" "}
          <span className="text-zinc-500">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default Register;
