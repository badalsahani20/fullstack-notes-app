import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Logo from "@/components/ui/Logo";
export default function ResetPasswordPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/users/reset-password/${token}`, { password });
            toast.success("Password reset successful! Please login");
            navigate("/login");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid or expired token");
        } finally {
            setLoading(false);
        }
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
                        <h1 className="text-2xl font-bold tracking-tight text-white">Reset your password</h1>
                        <p className="mt-1 text-sm text-zinc-500">Create a new secure password to continue.</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0f1625]/90 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">New password</label>
                            <Input
                                placeholder="At least 6 characters"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={6}
                                className="h-11 border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500/50"
                            />
                        </div>
                        <Button className="h-11 w-full bg-indigo-600 font-semibold text-white hover:bg-indigo-500 disabled:opacity-60" disabled={loading}>
                            {loading ? "Resetting..." : "Update Password"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
