import { CheckCircle2, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/useAuthStore";
import GoogleIcon from "@/assets/google.svg";
import { cn } from "@/lib/utils";
import { SectionLabel } from "./SettingsShared";

export const AccountTab = () => {
  const { user } = useAuthStore();

  const initials = user?.name
    ? user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="space-y-1">
      {/* Profile card */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-white/4 border border-white/8 mb-6">
        <Avatar className="h-14 w-14 border-2 border-indigo-500/30 shadow-lg">
          <AvatarImage src={user?.avatar || GoogleIcon} referrerPolicy="no-referrer" />
          <AvatarFallback className="bg-indigo-500/10 text-indigo-300 font-bold text-base">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">{user?.name || "Guest"}</p>
          <p className="text-sm text-zinc-400 truncate">{user?.email || "—"}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full",
                user?.isVerified
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              )}
            >
              <CheckCircle2 size={10} />
              {user?.isVerified ? "Verified" : "Unverified"}
            </span>
            {user?.provider === "google" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                <img src={GoogleIcon} alt="" className="h-2.5 w-2.5" />
                Google
              </span>
            )}
          </div>
        </div>
      </div>

      <SectionLabel>Account Details</SectionLabel>
      <div className="rounded-xl border border-white/8 bg-white/4 overflow-hidden divide-y divide-white/5">
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-sm text-zinc-400">Full name</span>
          <span className="text-sm text-zinc-200 font-medium">{user?.name || "—"}</span>
        </div>
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-sm text-zinc-400">Email address</span>
          <span className="text-sm text-zinc-200 font-medium">{user?.email || "—"}</span>
        </div>
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-sm text-zinc-400">Login method</span>
          <span className="text-sm text-zinc-200 font-medium capitalize">{user?.provider || "—"}</span>
        </div>
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-sm text-zinc-400">Member since</span>
          <span className="text-sm text-zinc-200 font-medium">
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
              : "—"}
          </span>
        </div>
      </div>

      <SectionLabel>Danger Zone</SectionLabel>
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
        <p className="text-sm text-zinc-300 mb-3">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <a
          href="mailto:badalsahani233@gmail.com?subject=Account Deletion Request&body=Hi, I'd like to permanently delete my Notesify account."
          className="inline-flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
        >
          Request account deletion <ChevronRight size={14} />
        </a>
      </div>
    </div>
  );
};
