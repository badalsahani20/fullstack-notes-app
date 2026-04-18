import { create } from "zustand";

interface EditorUIState {
  markerColor: string;
  setMarkerColor: (color: string) => void;
}

export const useEditorUIStore = create<EditorUIState>((set) => ({
  markerColor: "#fef08a", // Default clear yellow
  setMarkerColor: (color) => set({ markerColor: color }),
}));
