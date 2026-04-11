import { create } from "zustand";

interface PanelState {
  /** Whether the folder tree panel is open (desktop only).
   *  Hidden by default; toggled by the Folder icon in the activity bar. */
  isFolderPanelOpen: boolean;
  toggleFolderPanel: () => void;
  openFolderPanel: () => void;
  closeFolderPanel: () => void;
}

export const usePanelStore = create<PanelState>((set) => ({
  isFolderPanelOpen: false,
  toggleFolderPanel: () =>
    set((s) => ({ isFolderPanelOpen: !s.isFolderPanelOpen })),
  openFolderPanel: () => set({ isFolderPanelOpen: true }),
  closeFolderPanel: () => set({ isFolderPanelOpen: false }),
}));
