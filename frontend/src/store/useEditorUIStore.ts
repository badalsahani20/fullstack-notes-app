import { create } from "zustand";

interface EditorUIState {
  markerColor: string;
  setMarkerColor: (color: string) => void;
  shortcutsOpen: boolean;
  setShortcutsOpen: (open: boolean) => void;
}

export const useEditorUIStore = create<EditorUIState>((set) => ({
  markerColor: "#fef08a", // Default clear yellow
  setMarkerColor: (color) => set({ markerColor: color }),
  shortcutsOpen: false,
  setShortcutsOpen: (open) => set({ shortcutsOpen: open }),
}));
