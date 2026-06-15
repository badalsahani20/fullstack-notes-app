import { CheckCircle2, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/useAuthStore";
import GoogleIcon from "@/assets/google.svg";
import { cn } from "@/lib/utils";
import { SectionLabel } from "./SettingsShared";
import { useUserStats } from "@/hooks/user/useUserStats";

const formatMemberSince = (date?: string) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const AccountTab = () => {
  const { user } = useAuthStore();
  const { data: stats, isLoading: isStatsLoading } = useUserStats();

  const displayName = user?.name || stats?.name || "Guest";
  const displayEmail = user?.email || stats?.email || "-";
  const displayAvatar = user?.avatar || stats?.avatar || GoogleIcon;
  const provider = stats?.provider ?? user?.provider;
  const isVerified = user?.isVerified ?? stats?.isVerified ?? false;
  const memberSince = stats?.memberSince ?? user?.createdAt;
  const formattedMemberSince = formatMemberSince(memberSince);

  const initials = displayName !== "Guest"
    ? displayName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-4 p-4 rounded-xl bg-white/4 border border-white/8 mb-6">
        <Avatar className="h-14 w-14 border-2 border-indigo-500/30 shadow-lg">
          <AvatarImage src={displayAvatar} referrerPolicy="no-referrer" />
          <AvatarFallback className="bg-indigo-500/10 text-indigo-300 font-bold text-base">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">{displayName}</p>
          <p className="text-sm text-zinc-400 truncate">{displayEmail}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full",
                isVerified
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              )}
            >
              <CheckCircle2 size={10} />
              {isVerified ? "Verified" : "Unverified"}
            </span>
            {provider === "google" && (
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
        <div className="flex justify-between items-center gap-4 px-4 py-3">
          <span className="text-sm text-zinc-400">Full name</span>
          <span className="text-sm text-zinc-200 font-medium truncate">{displayName || "-"}</span>
        </div>
        <div className="flex justify-between items-center gap-4 px-4 py-3">
          <span className="text-sm text-zinc-400">Email address</span>
          <span className="text-sm text-zinc-200 font-medium truncate">{displayEmail}</span>
        </div>
        <div className="flex justify-between items-center gap-4 px-4 py-3">
          <span className="text-sm text-zinc-400">Login method</span>
          <span className="text-sm text-zinc-200 font-medium">
            {provider === "google"
              ? "Google"
              : provider === "local"
                ? "Email"
                : isStatsLoading
                  ? "Loading..."
                  : "-"}
          </span>
        </div>
        <div className="flex justify-between items-center gap-4 px-4 py-3">
          <span className="text-sm text-zinc-400">Member since</span>
          <span className="text-sm text-zinc-200 font-medium text-right">
            {formattedMemberSince || (isStatsLoading ? "Loading..." : "-")}
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
