import { useState, useMemo } from "react";
import {
  Mail, Calendar, Shield, LogOut,
  Pencil, Check, X, Chrome, KeyRound,
  FileText, Sparkles, TrendingUp, BadgeCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserStats } from "@/hooks/user/useUserStats";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getUsageColor(used: number, limit: number): string {
  const pct = limit > 0 ? (used / limit) * 100 : 0;
  if (pct >= 85) return "#ef4444";
  if (pct >= 60) return "#f59e0b";
  return "#22c55e";
}

function getUsageLabel(used: number, limit: number): string {
  const pct = limit > 0 ? (used / limit) * 100 : 0;
  if (pct >= 100) return "Limit reached";
  if (pct >= 85) return "Almost full";
  if (pct >= 60) return "Moderate use";
  return "Looks good";
}

function formatMemberSince(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ── Component ─────────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, clearAuth, updateUser } = useAuthStore();
  const { data: stats, isLoading } = useUserStats();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");

  // Prefer live auth store data, fall back to stats response
  const displayName   = user?.name   || stats?.name   || "Notesify User";
  const displayEmail  = user?.email  || stats?.email  || "";
  const displayAvatar = user?.avatar || stats?.avatar;
  const provider      = stats?.provider ?? user?.provider;
  const isVerified    = user?.isVerified ?? stats?.isVerified ?? false;
  const memberSince   = stats?.memberSince;

  const initials = useMemo(() => {
    if (!displayName) return "NS";
    return displayName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  }, [displayName]);

  const aiUsed    = stats?.aiCount ?? 0;
  const aiLimit   = stats?.limit   ?? 10;
  const usagePct  = Math.min((aiUsed / aiLimit) * 100, 100);
  const usageColor = getUsageColor(aiUsed, aiLimit);

  // ── Mutations ───────────────────────────────────────────────────────────────

  const { mutate: saveName, isPending: isSaving } = useMutation({
    mutationFn: async (name: string) => {
      const res = await api.put("/user/profile", { name });
      return res.data;
    },
    onSuccess: (data) => {
      updateUser({ name: data.user.name });
      setIsEditingName(false);
      toast.success("Name updated");
    },
    onError: () => toast.error("Failed to update name"),
  });

  const handleLogout = async () => {
    try { await api.post("/users/logout"); } catch { /* ignore */ }
    clearAuth();
    navigate("/login");
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "var(--panel-bg)" }}>

      {/* ── Page header ── */}
      <div
        className="flex-shrink-0 flex items-center px-5 py-4 border-b"
        style={{ borderColor: "var(--divider)" }}
      >
        <h2 className="text-lg font-bold" style={{ color: "var(--text-strong)" }}>Profile</h2>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-3 custom-scrollbar">

        {/* ── Profile hero card ── */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--window-bg)", border: "1px solid var(--divider)" }}
        >
          <div className="flex items-start gap-4">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white select-none"
                  style={{ background: "linear-gradient(135deg, #2f80ed, #1d73e8)" }}
                >
                  {initials}
                </div>
              )}
              {isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "#22c55e" }}
                  title="Verified account"
                >
                  <BadgeCheck size={12} className="text-white" />
                </div>
              )}
            </div>

            {/* Name / email / badges */}
            <div className="flex-1 min-w-0">

              {/* Name row with inline edit */}
              <div className="flex items-center gap-2 mb-1">
                {isEditingName ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveName(nameInput);
                        if (e.key === "Escape") { setIsEditingName(false); setNameInput(displayName); }
                      }}
                      className="flex-1 text-base font-semibold bg-transparent border-b outline-none"
                      style={{ color: "var(--text-strong)", borderColor: "var(--accent-strong)" }}
                      maxLength={50}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => saveName(nameInput)}
                      disabled={isSaving || !nameInput.trim()}
                      className="p-1 rounded-lg transition-opacity disabled:opacity-40"
                      style={{ color: "#22c55e" }}
                    >
                      <Check size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsEditingName(false); setNameInput(displayName); }}
                      className="p-1 rounded-lg"
                      style={{ color: "var(--muted-text)" }}
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-base truncate" style={{ color: "var(--text-strong)" }}>
                      {displayName}
                    </h3>
                    <button
                      type="button"
                      onClick={() => { setIsEditingName(true); setNameInput(displayName); }}
                      className="p-1 rounded-lg opacity-40 hover:opacity-80 transition-opacity flex-shrink-0"
                      style={{ color: "var(--muted-text)" }}
                      title="Edit name"
                    >
                      <Pencil size={13} />
                    </button>
                  </>
                )}
              </div>

              {/* Email */}
              <p className="text-sm truncate mb-2" style={{ color: "var(--muted-text)" }}>
                {displayEmail}
              </p>

              {/* Badges row */}
              <div className="flex flex-wrap gap-1.5">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: "var(--surface-muted)", color: "var(--muted-text)" }}
                >
                  {provider === "google" ? <Chrome size={10} /> : <Mail size={10} />}
                  {provider === "google" ? "Google" : "Email"}
                </span>
                {memberSince && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: "var(--surface-muted)", color: "var(--muted-text)" }}
                  >
                    <Calendar size={10} />
                    Since {formatMemberSince(memberSince)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Notes count */}
          <div
            className="rounded-2xl p-4 flex flex-col gap-0.5"
            style={{ background: "var(--window-bg)", border: "1px solid var(--divider)" }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <FileText size={13} style={{ color: "var(--accent-strong)" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-text)" }}>
                Notes
              </span>
            </div>
            <span className="text-2xl font-bold" style={{ color: "var(--text-strong)" }}>
              {isLoading ? "—" : stats?.notesCount ?? 0}
            </span>
            <span className="text-xs" style={{ color: "var(--muted-text)" }}>total created</span>
          </div>

          {/* AI used */}
          <div
            className="rounded-2xl p-4 flex flex-col gap-0.5"
            style={{ background: "var(--window-bg)", border: "1px solid var(--divider)" }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={13} style={{ color: "var(--accent-strong)" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-text)" }}>
                AI Today
              </span>
            </div>
            <span className="text-2xl font-bold" style={{ color: "var(--text-strong)" }}>
              {isLoading ? "—" : `${aiUsed}/${aiLimit}`}
            </span>
            <span className="text-xs" style={{ color: "var(--muted-text)" }}>requests used</span>
          </div>
        </div>

        {/* ── AI usage progress bar ── */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "var(--window-bg)", border: "1px solid var(--divider)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} style={{ color: "var(--accent-strong)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
                AI Requests Today
              </span>
            </div>
            {!isLoading && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: `${usageColor}22`, color: usageColor }}
              >
                {getUsageLabel(aiUsed, aiLimit)}
              </span>
            )}
          </div>

          {/* Bar track */}
          <div
            className="relative h-2.5 rounded-full overflow-hidden mb-2"
            style={{ background: "var(--surface-muted)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: isLoading ? "0%" : `${usagePct}%`,
                background: usageColor,
                boxShadow: `0 0 10px ${usageColor}55`,
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "var(--muted-text)" }}>
              {isLoading ? "Loading…" : `${aiUsed} of ${aiLimit} requests used`}
            </span>
            <span className="text-xs" style={{ color: "var(--muted-text)" }}>
              Resets at midnight
            </span>
          </div>
        </div>

        {/* ── Security ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--divider)" }}
        >
          {/* Section heading */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ background: "var(--window-bg)" }}
          >
            <Shield size={14} style={{ color: "var(--accent-strong)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
              Security
            </span>
          </div>

          {provider === "google" ? (
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ background: "var(--window-bg)", borderTop: "1px solid var(--divider)" }}
            >
              <Chrome size={15} style={{ color: "var(--muted-text)" }} />
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-strong)" }}>
                  Signed in with Google
                </p>
                <p className="text-xs" style={{ color: "var(--muted-text)" }}>
                  Password is managed by Google
                </p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => toast.info("Change password coming soon!")}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:opacity-80"
              style={{ background: "var(--window-bg)", borderTop: "1px solid var(--divider)" }}
            >
              <KeyRound size={15} style={{ color: "var(--muted-text)" }} />
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: "var(--text-strong)" }}>
                  Change Password
                </p>
                <p className="text-xs" style={{ color: "var(--muted-text)" }}>
                  Update your account password
                </p>
              </div>
            </button>
          )}
        </div>

        {/* ── Sign out ── */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-opacity hover:opacity-80"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.18)",
            color: "#ef4444",
          }}
        >
          <LogOut size={16} />
          <span className="text-sm font-semibold">Sign Out</span>
        </button>

      </div>
    </div>
  );
};

export default ProfilePage;
