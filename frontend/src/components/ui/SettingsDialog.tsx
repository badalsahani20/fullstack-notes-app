import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import type { EditorFontFamily, EditorFontSize, AppTheme, EditorWidth } from "@/store/useSettingsStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Palette,
  Type,
  Info,
  Shield,
  FileText,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Monitor,
  MoonStar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import GoogleIcon from "@/assets/google.svg";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "account" | "appearance" | "editor" | "about";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-3 mt-6 first:mt-0">
    {children}
  </p>
);

const ToggleRow = ({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0">
    <div>
      <p className="text-sm text-zinc-200 font-medium">{label}</p>
      {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        value ? "bg-indigo-500" : "bg-zinc-700"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-lg transition-transform duration-200",
          value ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  </div>
);

function OptionChip<T extends string>({
  label,
  value,
  current,
  onSelect,
}: {
  label: string;
  value: T;
  current: T;
  onSelect: (v: T) => void;
}) {
  const isSelected = value === current;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "relative flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-150",
        isSelected
          ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-300 shadow-[0_0_0_1px_rgba(99,102,241,0.3)]"
          : "border-white/8 bg-white/4 text-zinc-400 hover:border-white/15 hover:text-zinc-200"
      )}
    >
      {isSelected && <CheckCircle2 size={12} className="text-indigo-400 shrink-0" />}
      {label}
    </button>
  );
}

// ─── Tab Panels ──────────────────────────────────────────────────────────────

const AccountTab = () => {
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

const AppearanceTab = () => {
  const { theme, setTheme, editorWidth, setEditorWidth } = useSettingsStore();

  const themes: { value: AppTheme; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: "dark", label: "Dark", icon: <MoonStar size={16} />, desc: "Default zinc dark" },
    { value: "darker", label: "Darker", icon: <Monitor size={16} />, desc: "Deep charcoal" },
    { value: "midnight", label: "Midnight", icon: <Sparkles size={16} />, desc: "Pure black OLED" },
  ];

  return (
    <div>
      <SectionLabel>Theme</SectionLabel>
      <div className="grid grid-cols-3 gap-2">
        {themes.map(({ value, label, icon, desc }) => {
          const isSelected = theme === value;
          const bgMap: Record<AppTheme, string> = {
            dark: "bg-zinc-900",
            darker: "bg-[#111113]",
            midnight: "bg-[#030303]",
          };
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={cn(
                "relative flex flex-col items-start gap-3 rounded-xl border p-3 transition-all duration-150 text-left",
                isSelected
                  ? "border-indigo-500/60 bg-indigo-500/8 shadow-[0_0_0_1px_rgba(99,102,241,0.25)]"
                  : "border-white/8 bg-white/4 hover:border-white/15"
              )}
            >
              <div className={cn("w-full h-12 rounded-lg border border-white/8", bgMap[value])} />
              <div>
                <p className={cn("text-sm font-medium flex items-center gap-1.5", isSelected ? "text-indigo-300" : "text-zinc-300")}>
                  {icon} {label}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">{desc}</p>
              </div>
              {isSelected && (
                <CheckCircle2 size={14} className="text-indigo-400 absolute top-3 right-3" />
              )}
            </button>
          );
        })}
      </div>

      <SectionLabel>Editor Width</SectionLabel>
      <div className="flex gap-2 flex-wrap">
        {(
          [
            { value: "comfortable", label: "Comfortable" },
            { value: "wide", label: "Wide" },
            { value: "full", label: "Full Width" },
          ] as { value: EditorWidth; label: string }[]
        ).map(({ value, label }) => (
          <OptionChip
            key={value}
            label={label}
            value={value}
            current={editorWidth}
            onSelect={setEditorWidth}
          />
        ))}
      </div>
    </div>
  );
};

const EditorTab = () => {
  const {
    editorFont, setEditorFont,
    editorFontSize, setEditorFontSize,
    spellCheck, setSpellCheck,
    showWordCount, setShowWordCount,
    autoSaveIndicator, setAutoSaveIndicator,
    focusModeDefault, setFocusModeDefault,
  } = useSettingsStore();

  const fonts: { value: EditorFontFamily; label: string }[] = [
    { value: "Inter", label: "Inter" },
    { value: "Georgia", label: "Georgia" },
    { value: "Lora", label: "Lora" },
    { value: "JetBrains Mono", label: "Mono" },
    { value: "system-ui", label: "System" },
  ];

  const sizes: { value: EditorFontSize; label: string }[] = [
    { value: "sm", label: "Small" },
    { value: "md", label: "Medium" },
    { value: "lg", label: "Large" },
    { value: "xl", label: "X-Large" },
  ];

  return (
    <div>
      <SectionLabel>Font Family</SectionLabel>
      <div className="flex gap-2 flex-wrap">
        {fonts.map(({ value, label }) => (
          <OptionChip
            key={value}
            label={label}
            value={value}
            current={editorFont}
            onSelect={setEditorFont}
          />
        ))}
      </div>

      <SectionLabel>Font Size</SectionLabel>
      <div className="flex gap-2 flex-wrap">
        {sizes.map(({ value, label }) => (
          <OptionChip
            key={value}
            label={label}
            value={value}
            current={editorFontSize}
            onSelect={setEditorFontSize}
          />
        ))}
      </div>

      <SectionLabel>Behavior</SectionLabel>
      <div className="rounded-xl border border-white/8 bg-white/4 overflow-hidden px-4">
        <ToggleRow
          label="Spell Check"
          description="Highlight spelling errors as you type"
          value={spellCheck}
          onChange={setSpellCheck}
        />
        <ToggleRow
          label="Show Word Count"
          description="Display word and character count in the editor"
          value={showWordCount}
          onChange={setShowWordCount}
        />
        <ToggleRow
          label="Auto-save Indicator"
          description="Show a subtle saved indicator when changes sync"
          value={autoSaveIndicator}
          onChange={setAutoSaveIndicator}
        />
        <ToggleRow
          label="Default Focus Mode"
          description="Open notes in distraction-free focus mode by default"
          value={focusModeDefault}
          onChange={setFocusModeDefault}
        />
      </div>
    </div>
  );
};

const AboutTab = () => (
  <div className="space-y-1">
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <img src="/favicon.png" alt="Notesify" className="h-14 w-14 rounded-2xl shadow-lg" />
      <div>
        <p className="text-xl font-bold text-white tracking-tight">Notesify</p>
        <p className="text-sm text-zinc-500 mt-1">The AI-powered notes workspace</p>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
          Version 1.0
        </span>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          Beta
        </span>
      </div>
    </div>

    <SectionLabel>Legal</SectionLabel>
    <div className="rounded-xl border border-white/8 bg-white/4 overflow-hidden divide-y divide-white/5">
      <a
        href="https://notesify.in/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors group"
      >
        <span className="flex items-center gap-2.5 text-sm text-zinc-300">
          <FileText size={15} className="text-indigo-400" />
          Terms of Service
        </span>
        <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </a>
      <a
        href="https://notesify.in/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors group"
      >
        <span className="flex items-center gap-2.5 text-sm text-zinc-300">
          <Shield size={15} className="text-indigo-400" />
          Privacy Policy
        </span>
        <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </a>
    </div>

    <SectionLabel>Tech Stack</SectionLabel>
    <div className="rounded-xl border border-white/8 bg-white/4 overflow-hidden divide-y divide-white/5">
      {[
        ["Frontend", "React 18 + TypeScript + Vite"],
        ["Editor", "TipTap / ProseMirror"],
        ["Backend", "Node.js + Express"],
        ["Database", "MongoDB Atlas"],
        ["Cache", "Upstash Redis"],
        ["AI", "Google Gemini API"],
      ].map(([key, val]) => (
        <div key={key} className="flex justify-between items-center px-4 py-3">
          <span className="text-sm text-zinc-500">{key}</span>
          <span className="text-sm text-zinc-300 font-mono">{val}</span>
        </div>
      ))}
    </div>

    <div className="pt-6 text-center text-xs text-zinc-600">
      © {new Date().getFullYear()} Notesify · Crafted with care by{" "}
      <a
        href="https://github.com/badalsahani20"
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        badalsahani20
      </a>
    </div>
  </div>
);

// ─── Main Dialog ─────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "account", label: "Account", icon: <User size={15} /> },
  { id: "appearance", label: "Appearance", icon: <Palette size={15} /> },
  { id: "editor", label: "Editor", icon: <Type size={15} /> },
  { id: "about", label: "About", icon: <Info size={15} /> },
];

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("account");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 bg-[#0f0f11] border border-white/8 text-zinc-100 shadow-2xl overflow-hidden sm:max-w-2xl max-h-[90vh]"
        showCloseButton={true}
        aria-describedby={undefined}
      >
        <div className="flex h-full min-h-[520px]">
          {/* ── Sidebar nav ── */}
          <aside className="w-44 shrink-0 border-r border-white/8 bg-[#0c0c0e] flex flex-col py-4 px-2 gap-0.5">
            <DialogHeader className="px-2 pb-4">
              <DialogTitle className="text-sm font-semibold text-zinc-400 tracking-wide uppercase">
                Settings
              </DialogTitle>
            </DialogHeader>
            {TABS.map(({ id, label, icon }) => (
              <button
                key={id}
                type="button"
                id={`settings-tab-${id}`}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left",
                  activeTab === id
                    ? "bg-indigo-500/12 text-indigo-300 border border-indigo-500/20"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                )}
              >
                <span className={activeTab === id ? "text-indigo-400" : "text-zinc-600"}>
                  {icon}
                </span>
                {label}
              </button>
            ))}
          </aside>

          {/* ── Content area ── */}
          <div className="flex-1 min-w-0 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {activeTab === "account" && <AccountTab />}
            {activeTab === "appearance" && <AppearanceTab />}
            {activeTab === "editor" && <EditorTab />}
            {activeTab === "about" && <AboutTab />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
