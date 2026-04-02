import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

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
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black p-4">
            {/* Dynamic Background Elements */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            
            {/* Sophisticated Glows */}
            <div className="pointer-events-none absolute -top-24 left-1/4 h-[500px] w-[500px] rounded-full bg-white/5 blur-[120px] animate-pulse" />
            <div className="pointer-events-none absolute -bottom-24 right-1/4 h-[500px] w-[500px] rounded-full bg-white/5 blur-[120px] animate-pulse" />

            <div className="relative w-full max-w-md">
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
                        <h1 className="text-3xl font-bold tracking-tight text-white">Reset Password</h1>
                        <p className="text-sm text-zinc-500">Create a new secure password to continue.</p>
                    </div>
                </div>

                <div className="group relative">
                    <div className="absolute -inset-[1px] rounded-[21px] bg-gradient-to-b from-white/20 via-white/5 to-white/20 opacity-100" />
                    <div className="relative rounded-2xl bg-gradient-to-b from-[#121212] to-black p-8 shadow-[0_32px_100px_rgba(0,0,0,1)] backdrop-blur-3xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 ml-1">New Password</label>
                                <Input
                                    placeholder="At least 6 characters"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={6}
                                    className="h-12 border-white/10 bg-white/[0.03] text-white placeholder:text-zinc-700 focus-visible:border-white/30 focus-visible:ring-white/5 transition-all duration-300"
                                />
                            </div>
                            <Button className="h-12 w-full bg-white font-bold text-black hover:bg-zinc-200 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.1)]" disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                                        Updating…
                                    </span>
                                ) : "Update Password"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

