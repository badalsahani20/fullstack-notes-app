import { create  } from "zustand";
import api from "@/lib/api";

export interface Folder {
    _id: string;
    name: string;
    color?: string;
    version: number;
}

interface FolderState {
    folders: Folder[];
    loading: boolean;
    activeFolderId: string | null;
    fetchFolders: () => Promise<void>;
    addFolder: (name: string) => Promise<void>;
    setActiveFolder: (id: string | null) => void;
}

export const useFolderStore = create<FolderState>((set, get) => ({
    folders: [],
    loading: false,
    activeFolderId: null,

    fetchFolders: async () => {
        set({ loading: true });
        try {
            const res = await api.get('/folders');
            set({ folders: res.data });
        } catch (err) {
            console.error("Failed to fetch folders", err);
        }finally{
            set({ loading: false });
        }
    },

    addFolder: async (name: string) => {
        try {
            const res = await api.post('/folders', { name });
            set({ folders: [...get().folders, res.data.folder ] });
        } catch (error) {
            console.log("Error creating folder", error);
        }
    },

    setActiveFolder: (_id) => set({ activeFolderId:_id}),
}))