import React from "react";
import { MoonStar, Monitor, Sparkles, CheckCircle2 } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import type { AppTheme, EditorWidth } from "@/store/useSettingsStore";
import { cn } from "@/lib/utils";
import { SectionLabel, OptionChip } from "./SettingsShared";

export const AppearanceTab = () => {
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
