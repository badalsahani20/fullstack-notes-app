import { create } from "zustand";
import { persist } from "zustand/middleware";

export type EditorFontFamily = "Inter" | "Georgia" | "JetBrains Mono" | "Lora" | "system-ui";
export type EditorFontSize = "sm" | "md" | "lg" | "xl";
export type AppTheme = "dark" | "darker" | "midnight";
export type EditorWidth = "comfortable" | "wide" | "full";
export type SpellCheck = boolean;
export type LineSpacing = "normal" | "relaxed";

// ─── Non-persisted UI state (dialog open/close) ───────────────────────────────
interface SettingsUIStore {
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

export const useSettingsUIStore = create<SettingsUIStore>()((set) => ({
  settingsOpen: false,
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
}));

interface SettingsState {
  // Appearance
  theme: AppTheme;
  editorWidth: EditorWidth;

  // Editor preferences
  editorFont: EditorFontFamily;
  editorFontSize: EditorFontSize;
  spellCheck: SpellCheck;
  showWordCount: boolean;
  autoSaveIndicator: boolean;
  focusModeDefault: boolean;
  lineSpacing: LineSpacing;

  // Actions
  setTheme: (theme: AppTheme) => void;
  setEditorWidth: (width: EditorWidth) => void;
  setEditorFont: (font: EditorFontFamily) => void;
  setEditorFontSize: (size: EditorFontSize) => void;
  setSpellCheck: (val: boolean) => void;
  setShowWordCount: (val: boolean) => void;
  setAutoSaveIndicator: (val: boolean) => void;
  setFocusModeDefault: (val: boolean) => void;
  setLineSpacing: (val: LineSpacing) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Defaults
      theme: "dark",
      editorWidth: "comfortable",
      editorFont: "Inter",
      editorFontSize: "md",
      spellCheck: true,
      showWordCount: true,
      autoSaveIndicator: true,
      focusModeDefault: false,
      lineSpacing: "normal",

      setTheme: (theme) => set({ theme }),
      setEditorWidth: (editorWidth) => set({ editorWidth }),
      setEditorFont: (editorFont) => set({ editorFont }),
      setEditorFontSize: (editorFontSize) => set({ editorFontSize }),
      setSpellCheck: (spellCheck) => set({ spellCheck }),
      setShowWordCount: (showWordCount) => set({ showWordCount }),
      setAutoSaveIndicator: (autoSaveIndicator) => set({ autoSaveIndicator }),
      setFocusModeDefault: (focusModeDefault) => set({ focusModeDefault }),
      setLineSpacing: (lineSpacing) => set({ lineSpacing }),
    }),
    {
      name: "notesify-settings",
    }
  )
);
