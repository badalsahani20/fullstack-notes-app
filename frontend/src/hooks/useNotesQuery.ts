import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Note } from "@/store/useNoteStore";
import { useQueryClient } from "@tanstack/react-query";

{/* ["notes"] → active notes
["notes", "archive"] → archived
["notes", "trash"] → deleted */}

const fetchNotes = async (): Promise<Note[]> => {
    const res = await api.get("/notes/");
    const data = res.data.notes || res.data;
    return Array.isArray(data) ? data : [];
}

export const useNotesQuery = () => {
    return useQuery({
        queryKey: ["notes"], //All notes
        queryFn: fetchNotes,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1
    });
};

const fetchNote = async (noteId: string): Promise<Note> => {
    const res = await api.get(`/notes/${noteId}`);
    return res.data.note || res.data;
}

export const useNoteQuery = (noteId: string) => {
    const queryClient = useQueryClient()
    return useQuery({
        queryKey: ["note", noteId],
        queryFn: () => fetchNote(noteId),
        enabled: !!noteId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,

        initialData: () => {
            const notes = queryClient.getQueryData<Note[]>(["notes"])
            return notes?.find((note) => note._id === noteId);
        }
    });
}



export const useTrashQuery = () => {
    return useQuery({
        queryKey: ["notes", "trash"],
        queryFn: async () => {
            const res = await api.get("/trash/");
            // res.data contains { notes, folders }
            return res.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1
    });
}


export const useArchivedQuery = () => {
    return useQuery({
        queryKey: ["notes", "archive"],
        queryFn: async () => {
            const res = await api.get("/notes/archive");
            return res.data.notes || res.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1
    });
}


// future usage:["notes"] // all notes
// ["notes", "folder", folderId]
// ["notes", "search", query]
// ["notes", "archive"]