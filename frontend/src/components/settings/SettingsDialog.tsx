import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Palette, Type, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Sub-components
import { AccountTab } from "./AccountTab";
import { AppearanceTab } from "./AppearanceTab";
import { EditorTab } from "./EditorTab";
import { AboutTab } from "./AboutTab";

type Tab = "account" | "appearance" | "editor" | "about";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
export default SettingsDialog;
