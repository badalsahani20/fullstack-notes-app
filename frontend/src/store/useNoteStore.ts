import { create } from "zustand";
import api from "@/lib/api";

export interface Note {
  _id: string;
  title: string;
  content: string;
  folder: string | null;
  color: string;
  pinned: boolean;
  version: number;
  isDeleted: boolean;
  updatedAt: string;
}

interface NoteState {
  notes: Note[];
  trash: Note[];
  activeNote: Note | null;

  loading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchNotes: (folderId?: string | null) => Promise<void>;
  fetchTrash: () => Promise<void>;
  setActiveNote: (note: Note | null) => void;
  createNote: (folderId?: string | null) => Promise<Note | null>;
  updateNote: (noteId: string, updates: Partial<Note>) => Promise<void>;
  softDeleteNote: (noteId: string) => Promise<void>;
  togglePinning: (noteId: string) => Promise<void>;
  restoreNote: (noteId: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  trash: [],
  activeNote: null,
  loading: false,
  isSaving: false,
  error: null,

  fetchNotes: async (folderId = null) => {
    set({ loading: true });
    try {
      const url = folderId ? `/folders/${folderId}/notes` : "/notes/";
      const res = await api.get(url);
      const data = res.data.notes || res.data;
      set({ notes: Array.isArray(data) ? data : [] });
    } catch (error) {
      set({ error: "Failed to load notes" });
    } finally {
      set({ loading: false });
    }
  },

  fetchTrash: async () => {
    set({ loading: true });
    try {
      // Ensure this matches your backend route exactly
      const res = await api.get("/trash/"); 
      const data = res.data.notes || res.data;
      set({ trash: Array.isArray(data) ? data : [] });
    } catch (error) {
      set({ error: "Failed to load trash notes" });
    } finally {
      set({ loading: false });
    }
  },

  setActiveNote: (note) => set({ activeNote: note }),

  createNote: async (folderId = null) => {
    try {
      const res = await api.post("/notes/", {
        title: "Untitled Note",
        folder: folderId,
      });

      const newNote = res.data.note || res.data;
      set({ notes: [newNote, ...get().notes] });
      return newNote;
    } catch (error) {
      set({ error: "Failed to create note" });
      return null;
    }
  },

  updateNote: async (noteId, updates) => {
    const currentNote = get().activeNote;
    if (!currentNote) return;

    set({ isSaving: true });
    try {
      const res = await api.put(`/notes/${noteId}`, {
        ...updates,
        version: currentNote.version,
      });

      const { updatedNote, conflict, serverNote } = res.data;
      if (conflict) {
        set({ error: "Conflict detected! Please refresh", isSaving: false });
        // Optional: set activeNote to serverNote to show the difference
        return;
      }

      set({
        notes: get().notes.map((n) => (n._id === noteId ? updatedNote : n)),
        activeNote: updatedNote,
        isSaving: false,
      });
    } catch (error) {
      set({ isSaving: false, error: "Save failed" });
    }
  },

  softDeleteNote: async (noteId) => {
    const noteToDelete = get().notes.find((n) => n._id === noteId);
    if (!noteToDelete) return;

    try {
      await api.delete(`/notes/${noteId}`, {
        data: { version: noteToDelete.version },
      });

      set({
        notes: get().notes.filter((n) => n._id !== noteId),
        trash: [{ ...noteToDelete, isDeleted: true }, ...get().trash],
        activeNote: get().activeNote?._id === noteId ? null : get().activeNote,
      });
    } catch (error) {
      console.error("Deletion failed", error);
    }
  },

  togglePinning: async (noteId) => {
    try {
      const res = await api.patch(`/notes/${noteId}/pin`);
      const updatedNote = res.data.note || res.data;
      set({
        notes: get().notes.map((n) => (n._id === noteId ? updatedNote : n)),
        // If the pinned note is currently active, update it too
        activeNote: get().activeNote?._id === noteId ? updatedNote : get().activeNote
      });
    } catch (error) {
      console.error("Pinning failed", error);
    }
  },

  restoreNote: async (noteId) => {
    set({ loading: true });
    try {
      const res = await api.patch(`/trash/restore/note/${noteId}`);
      const restoredNote = res.data.note || res.data;

      set((state) => ({
        trash: state.trash.filter((n) => n._id !== noteId),
        notes: [restoredNote, ...state.notes],
        loading: false,
      }));
    } catch (error) {
      console.error("Restore failed", error);
      set({ loading: false, error: "Could not restore note" });
    }
  },
}));