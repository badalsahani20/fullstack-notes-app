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

const ALL_NOTES_CACHE_KEY = "__all__";
const NOTES_CACHE_TTL_MS = 60_000;

const getNotesCacheKey = (folderId?: string | null) => folderId ?? ALL_NOTES_CACHE_KEY;

interface NoteState {
  notes: Note[];
  notesCache: Record<string, Note[]>;
  notesFetchedAt: Record<string, number>;
  currentNotesViewKey: string;
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

type UnknownNote = Partial<Note> & { id?: string };

const normalizeNote = (value: unknown): Note | null => {
  if (!value || typeof value !== "object") return null;

  const maybe = value as UnknownNote;
  const normalizedId = typeof maybe._id === "string" ? maybe._id : typeof maybe.id === "string" ? maybe.id : null;
  if (!normalizedId) return null;

  return {
    _id: normalizedId,
    title: typeof maybe.title === "string" ? maybe.title : "Untitled Note",
    content: typeof maybe.content === "string" ? maybe.content : "",
    folder: typeof maybe.folder === "string" || maybe.folder === null ? maybe.folder : null,
    color: typeof maybe.color === "string" ? maybe.color : "#1d2436",
    pinned: typeof maybe.pinned === "boolean" ? maybe.pinned : false,
    version: typeof maybe.version === "number" ? maybe.version : 0,
    isDeleted: typeof maybe.isDeleted === "boolean" ? maybe.isDeleted : false,
    updatedAt: typeof maybe.updatedAt === "string" ? maybe.updatedAt : new Date().toISOString(),
  };
};

const normalizeNoteList = (value: unknown): Note[] => {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeNote).filter((note): note is Note => Boolean(note));
};

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  notesCache: {},
  notesFetchedAt: {},
  currentNotesViewKey: ALL_NOTES_CACHE_KEY,
  trash: [],
  activeNote: null,
  loading: false,
  isSaving: false,
  error: null,

  fetchNotes: async (folderId = null) => {
    const cacheKey = getNotesCacheKey(folderId);
    set({ currentNotesViewKey: cacheKey });

    const cachedNotes = get().notesCache[cacheKey];
    const cachedAt = get().notesFetchedAt[cacheKey] ?? 0;
    if (cachedNotes) {
      set({ notes: cachedNotes, loading: false, error: null });
      if (Date.now() - cachedAt < NOTES_CACHE_TTL_MS) {
        return;
      }
    } else {
      set({ loading: true, error: null });
    }

    try {
      const url = folderId ? `/folders/${folderId}/notes` : "/notes/";
      const res = await api.get(url);
      const data = res.data.notes || res.data;
      const normalizedNotes = normalizeNoteList(data);
      set((state) => ({
        notes: state.currentNotesViewKey === cacheKey ? normalizedNotes : state.notes,
        notesCache: {
          ...state.notesCache,
          [cacheKey]: normalizedNotes,
        },
        notesFetchedAt: {
          ...state.notesFetchedAt,
          [cacheKey]: Date.now(),
        },
      }));
    } catch (error) {
      set({ error: "Failed to load notes" });
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },

  fetchTrash: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/trash/");
      const data = res.data.notes || res.data;
      set({ trash: normalizeNoteList(data) });
    } catch (error) {
      set({ error: "Failed to load trash notes" });
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },

  setActiveNote: (note) => set({ activeNote: note }),

  createNote: async (folderId = null) => {
    try {
      const res = await api.post("/notes/", {
        title: "Untitled Note",
        content: "",
        folder: folderId,
      });

      const rawNote = res.data.note || res.data;
      const newNote = normalizeNote(rawNote);
      if (!newNote) {
        set({ error: "Failed to create note" });
        return null;
      }

      const targetKey = getNotesCacheKey(newNote.folder);
      set((state) => {
        const nextNotesCache = { ...state.notesCache };
        const nextFetchedAt = { ...state.notesFetchedAt };

        nextNotesCache[targetKey] = [newNote, ...(nextNotesCache[targetKey] ?? [])];
        nextFetchedAt[targetKey] = Date.now();

        if (targetKey !== ALL_NOTES_CACHE_KEY) {
          nextNotesCache[ALL_NOTES_CACHE_KEY] = [newNote, ...(nextNotesCache[ALL_NOTES_CACHE_KEY] ?? [])];
          nextFetchedAt[ALL_NOTES_CACHE_KEY] = Date.now();
        }

        return {
          notes: [newNote, ...state.notes],
          activeNote: newNote,
          notesCache: nextNotesCache,
          notesFetchedAt: nextFetchedAt,
        };
      });
      return newNote;
    } catch (error) {
      set({ error: "Failed to create note" });
      console.error(error);
      return null;
    }
  },

  updateNote: async (noteId, updates) => {
    const currentNote = get().notes.find((n) => n._id === noteId) || get().activeNote;
    if (!currentNote) return;

    set({ isSaving: true });
    try {
      const res = await api.put(`/notes/${noteId}`, {
        ...updates,
        version: currentNote.version,
      });

      const { updatedNote: rawUpdatedNote, conflict } = res.data;
      if (conflict) {
        set({ error: "Conflict detected! Please refresh", isSaving: false });
        return;
      }

      const updatedNote = normalizeNote(rawUpdatedNote ?? res.data.note ?? res.data);
      if (!updatedNote) {
        set({ isSaving: false, error: "Save failed: invalid server response" });
        return;
      }

      set({
        isSaving: false,
      });

      set((state) => {
        const nextNotesCache = Object.fromEntries(
          Object.entries(state.notesCache).map(([key, list]) => [key, list.map((n) => (n._id === noteId ? updatedNote : n))])
        );

        return {
          notes: state.notes.map((n) => (n._id === noteId ? updatedNote : n)),
          activeNote: state.activeNote?._id === noteId ? updatedNote : state.activeNote,
          notesCache: nextNotesCache,
        };
      });
    } catch (error) {
      set({ isSaving: false, error: "Save failed" });
      console.error(error);
    }
  },

  softDeleteNote: async (noteId) => {
    const noteToDelete = get().notes.find((n) => n._id === noteId);
    if (!noteToDelete) return;

    try {
      await api.delete(`/notes/${noteId}`, {
        data: { version: noteToDelete.version },
      });

      set((state) => {
        const nextNotesCache = Object.fromEntries(
          Object.entries(state.notesCache).map(([key, list]) => [key, list.filter((n) => n._id !== noteId)])
        );

        return {
          notes: state.notes.filter((n) => n._id !== noteId),
          notesCache: nextNotesCache,
          trash: [{ ...noteToDelete, isDeleted: true }, ...state.trash],
          activeNote: state.activeNote?._id === noteId ? null : state.activeNote,
        };
      });
    } catch (error) {
      console.error("Deletion failed", error);
    }
  },

  togglePinning: async (noteId) => {
    try {
      const res = await api.patch(`/notes/${noteId}/pin`);
      const updatedNote = normalizeNote(res.data.note || res.data);
      if (!updatedNote) return;

      set({
        notes: get().notes.map((n) => (n._id === noteId ? updatedNote : n)),
        activeNote: get().activeNote?._id === noteId ? updatedNote : get().activeNote,
      });
    } catch (error) {
      console.error("Pinning failed", error);
    }
  },

  restoreNote: async (noteId) => {
    set({ loading: true });
    try {
      const res = await api.patch(`/trash/restore/note/${noteId}`);
      const restoredNote = normalizeNote(res.data.note || res.data);

      set((state) => ({
        trash: state.trash.filter((n) => n._id !== noteId),
        notes: restoredNote ? [restoredNote, ...state.notes] : state.notes,
        notesCache: restoredNote
          ? {
              ...state.notesCache,
              [getNotesCacheKey(restoredNote.folder)]: [
                restoredNote,
                ...(state.notesCache[getNotesCacheKey(restoredNote.folder)] ?? []),
              ],
              [ALL_NOTES_CACHE_KEY]:
                restoredNote.folder === null
                  ? [restoredNote, ...(state.notesCache[ALL_NOTES_CACHE_KEY] ?? [])]
                  : [restoredNote, ...(state.notesCache[ALL_NOTES_CACHE_KEY] ?? [])],
            }
          : state.notesCache,
        loading: false,
      }));
    } catch (error) {
      console.error("Restore failed", error);
      set({ loading: false, error: "Could not restore note" });
    }
  },
}));
