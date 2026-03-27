import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Logo from "@/components/ui/Logo";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setLoading(true);
        try {
            await api.post("/users/forgot-password", { email });
            setSent(true);
            toast.success("Reset link sent!");
        } catch (error) {
            toast.error("Failed to send reset link");
        } finally {
            setLoading(false);
        }
    }

    if (sent) {
        return (
            <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#070b14] p-4">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#1f2a44_0%,transparent_55%)] opacity-60" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-15" />
                <div className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[640px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-violet-600/10 blur-[110px]" />

                <div className="relative w-full max-w-md">
                    <div className="mb-8 flex flex-col items-center gap-3 text-center">
                        <Logo size={56} className="shadow-2xl" />
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white">Check your email</h1>
                            <p className="mt-1 text-sm text-zinc-500">We sent a reset link to {email}.</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#0f1625]/90 p-8 text-center shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                        <p className="text-sm text-zinc-400">
                            If you don’t see it, check your spam folder or try again.
                        </p>
                        <div className="mt-6 space-y-3">
                            <Link
                                to="/login"
                                className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                            >
                                Return to Login
                            </Link>
                            <Link to="/forgot-password" className="text-xs font-medium text-zinc-500 transition hover:text-zinc-300">
                                Send another link
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#070b14] p-4">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#1f2a44_0%,transparent_55%)] opacity-60" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-15" />
            <div className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[640px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-violet-600/10 blur-[110px]" />

            <div className="relative w-full max-w-md">
                <div className="mb-8 flex flex-col items-center gap-3 text-center">
                    <Logo size={56} className="shadow-2xl" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">Forgot your password?</h1>
                        <p className="mt-1 text-sm text-zinc-500">We’ll email you a secure reset link.</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0f1625]/90 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">Email</label>
                            <Input 
                                placeholder="name@example.com" 
                                type="email" 
                                required 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-11 border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500/50"
                            />
                        </div>
                        <Button className="h-11 w-full bg-indigo-600 font-semibold text-white hover:bg-indigo-500 disabled:opacity-60" disabled={loading}>
                            {loading ? "Sending..." : "Send Reset Link"}
                        </Button>
                    </form>
                    <Link to="/login" className="mt-4 inline-flex w-full justify-center text-xs font-medium text-zinc-500 transition hover:text-zinc-300">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
