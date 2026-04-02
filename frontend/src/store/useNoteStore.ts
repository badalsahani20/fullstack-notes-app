import { create } from "zustand";

export interface Note {
  _id: string;
  title: string;
  content: string;
  folder: string | null;
  color: string;
  pinned: boolean;
  version: number;
  isDeleted: boolean;
  isArchived: boolean;
  updatedAt: string;
  lastAccessedAt: string | null;
  chatHistory?: { id: string; role: 'user' | 'assistant'; content: string }[];
}

export interface TrashFolder {
  _id: string;
  name: string;
  color: string;
  version: number;
  pinned: boolean;
  isDeleted: boolean;
  updatedAt: string;
}

interface NoteState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
}

export const useNoteStore = create<NoteState>((set) => ({
  searchQuery: "",
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  activeNoteId: null,
  setActiveNoteId: (id: string | null) => set({ activeNoteId: id }),
}));
