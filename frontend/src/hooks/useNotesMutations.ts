import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api";
import type { Note } from "@/store/useNoteStore";
import { toast } from "sonner";

// --- NORMALIZED UPDATE HELPERS ---
const sortNotes = (notes: Note[]) => {
    return [...notes].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.updatedAt || Date.now()).getTime() - new Date(a.updatedAt || Date.now()).getTime();
    });
};

const updateNoteInList = (list: Note[], updated: Partial<Note> & { _id: string }) =>
    sortNotes(list.map((n) => (n._id === updated._id ? { ...n, ...updated } as Note : n)));

const removeNoteFromList = (list: Note[], noteId: string) =>
    list.filter((n) => n._id !== noteId);

const addNoteToList = (list: Note[], note: Note) =>
    sortNotes([note, ...removeNoteFromList(list, note._id)]);

export const useCreateNoteMutation = () => {
    const queryClient = useQueryClient();


    return useMutation({
        mutationFn: async (params: { folderId?: string | null; title?: string; content?: string } = {}) => {
            const { folderId = null, title = "Untitled Note", content = "" } = params;
            const res = await api.post("/notes/", {
                title,
                content,
                folder: folderId,
            });
            return res.data.note || res.data;
        },

        onSuccess: (newNote) => {
            queryClient.setQueryData(["notes"], (old: Note[] = []) => addNoteToList(old, newNote));
            queryClient.setQueryData(["note", newNote._id], newNote); //Single note cache
        },
        onError: (error) => {
            console.error("Failed to create note: ", error);
            toast.error("Failed to create note");
        }
    })
}

export const useDeleteNoteMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ noteId, version }: { noteId: string, version: number }) => {
            await api.delete(`/notes/${noteId}`, { data: { version } });
        },
        onMutate: async ({ noteId }) => {
            await queryClient.cancelQueries({ queryKey: ["notes"] });
            await queryClient.cancelQueries({ queryKey: ["notes", "archive"] });
            await queryClient.cancelQueries({ queryKey: ["notes", "trash"] });
            const previousNotes = queryClient.getQueryData<Note[]>(["notes"]);
            
            // Remove from UI instantly
            queryClient.setQueryData(["notes"], (old: Note[] = []) => removeNoteFromList(old, noteId));
            
            
            return { previousNotes };
        },
        onSuccess: (_, variables) => {
            queryClient.removeQueries({ queryKey: ["note", variables.noteId] }); //Remove from cache

            // Invalidate the trash query so it refetches
            queryClient.invalidateQueries({ queryKey: ["notes", "trash"] });
        },
        onError: (error: any, _vars, context) => {
            if (error?.response?.status === 404) {
               // Note is already gone on the server. Dont rollback optimistic UI.
               queryClient.invalidateQueries({ queryKey: ["notes"] });
               return;
            }
            queryClient.setQueryData(["notes"], context?.previousNotes);
            console.error("Failed to delete note: ", error);
            toast.error("Failed to delete note");
        }
    });
};

export const useUpdateNoteMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ noteId, updates, version }: { noteId: string, updates: Partial<Note>, version: number }) => {
            try {
                const res = await api.put(`/notes/${noteId}`, {
                    ...updates,
                    version,
                });
                return res.data.updatedNote || res.data.note || res.data;
            } catch (error: any) {
                // If we get a 409 Conflict, it's highly likely a race condition from rapid debounced auto-saves.
                // The server conveniently sends back the current database version. Let's grab it and auto-retry!
                if (error?.response?.status === 409 && error?.response?.data?.serverVersion) {
                    const newServerVersion = error.response.data.serverVersion.version;
                    const retryRes = await api.put(`/notes/${noteId}`, {
                        ...updates,
                        version: newServerVersion,
                    });
                    return retryRes.data.updatedNote || retryRes.data.note || retryRes.data;
                }
                throw error;
            }
        },
        onMutate: async ({ noteId, updates }) => {
            await queryClient.cancelQueries({ queryKey: ["notes"] });
            await queryClient.cancelQueries({ queryKey: ["note", noteId] });

            const previousNotes = queryClient.getQueryData<Note[]>(["notes"]);
            const previousNote = queryClient.getQueryData<Note>(["note", noteId]);

            queryClient.setQueryData(["notes"], (old: Note[] = []) =>
                updateNoteInList(old, { _id: noteId, ...updates })
            );
            
            if (previousNote) {
                queryClient.setQueryData(["note", noteId], { ...previousNote, ...updates });
            }

            return { previousNotes, previousNote };
        },
        onSuccess: (updatedNote, variables) => {
            queryClient.setQueryData(["note", variables.noteId], updatedNote);
            queryClient.setQueryData(["notes"], (old: Note[] = []) => updateNoteInList(old, updatedNote));
        },
        onError: (error, { noteId }, context) => {
            queryClient.setQueryData(["notes"], context?.previousNotes);
            if (context?.previousNote) {
                queryClient.setQueryData(["note", noteId], context.previousNote);
            }
            console.error("Failed to update note: ", error);
            toast.error("Failed to save changes");
        }
    });
};

export const useTogglePinMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ noteId, version }: { noteId: string, version: number }) => {
            try {
                const res = await api.patch(`/notes/${noteId}/pin`, { version });
                return res.data.updatedNote || res.data.note || res.data;
            } catch (error: any) {
                if (error?.response?.status === 409 && error?.response?.data?.serverVersion) {
                    const newServerVersion = error.response.data.serverVersion.version;
                    const retryRes = await api.patch(`/notes/${noteId}/pin`, { version: newServerVersion });
                    return retryRes.data.updatedNote || retryRes.data.note || retryRes.data;
                }
                throw error;
            }
        },
        onSuccess: (updatedNote, variables) => {
            queryClient.setQueryData(["note", variables.noteId], updatedNote);
            queryClient.setQueryData(["notes"], (old: Note[] = []) => updateNoteInList(old, updatedNote));
        },
        onMutate: async ({ noteId }) => {
            await queryClient.cancelQueries({ queryKey: ["notes"] });

            const previous = queryClient.getQueryData<Note[]>(["notes"]);
            const targetNote = previous?.find((n) => n._id === noteId);

            if (targetNote) {
                queryClient.setQueryData(["notes"], (old: Note[] = []) =>
                    updateNoteInList(old, { _id: noteId, pinned: !targetNote.pinned })
                );
            }

            return { previous };
        },

        onError: (error: any, _vars, context) => {
            if (error?.response?.status === 404) {
               queryClient.invalidateQueries({ queryKey: ["notes"] });
               return;
            }
            queryClient.setQueryData(["notes"], context?.previous);
            console.error("Failed to favorite note: ", error);
            toast.error("Failed to update favorites");
        },
    });
}

export const useToggleArchiveMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ noteId, version }: { noteId: string; version: number }) => {
            try {
                const res = await api.patch(`/notes/${noteId}/archive`, { version });
                return res.data.note || res.data;
            } catch (error: any) {
                if (error?.response?.status === 409 && error?.response?.data?.serverVersion) {
                    const newServerVersion = error.response.data.serverVersion.version;
                    const retryRes = await api.patch(`/notes/${noteId}/archive`, { version: newServerVersion });
                    return retryRes.data.note || retryRes.data;
                }
                throw error;
            }
        },
        onMutate: async ({ noteId }) => {
            await queryClient.cancelQueries({ queryKey: ["notes"] });
            await queryClient.cancelQueries({ queryKey: ["notes", "archive"] });

            const previousNotes = queryClient.getQueryData<Note[]>(["notes"]);
            const previousArchive = queryClient.getQueryData<Note[]>(["notes", "archive"]);
            const previousNote = queryClient.getQueryData<Note>(["note", noteId]);

            // Try to find the note to know its current archive status
            const targetNote = previousNotes?.find(n => n._id === noteId) || previousArchive?.find(n => n._id === noteId) || previousNote;

            if (targetNote) {
                const isArchived = !targetNote.isArchived;
                const optimisticallyUpdatedNote = { ...targetNote, isArchived };

                queryClient.setQueryData(["note", noteId], optimisticallyUpdatedNote);

                queryClient.setQueryData(["notes"], (old: Note[] = []) => {
                    if (!isArchived) return addNoteToList(old, optimisticallyUpdatedNote);
                    return removeNoteFromList(old, noteId);
                });

                queryClient.setQueryData(["notes", "archive"], (old: Note[] = []) => {
                    if (isArchived) return addNoteToList(old, optimisticallyUpdatedNote);
                    return removeNoteFromList(old, noteId);
                });
            }

            return { previousNotes, previousArchive, previousNote };
        },
        onSuccess: (updatedNote, { noteId }) => {
            // Minimal correction: Just update the properties of the note wherever it currently resides
            queryClient.setQueryData(["note", noteId], updatedNote);
            queryClient.setQueryData(["notes"], (old: Note[] = []) => updateNoteInList(old, updatedNote));
            queryClient.setQueryData(["notes", "archive"], (old: Note[] = []) => updateNoteInList(old, updatedNote));
        },
        onError: (error: any, { noteId }, context) => {
            if (error?.response?.status === 404) {
               queryClient.invalidateQueries({ queryKey: ["notes"] });
               queryClient.invalidateQueries({ queryKey: ["notes", "archive"] });
               return;
            }
            queryClient.setQueryData(["notes"], context?.previousNotes);
            queryClient.setQueryData(["notes", "archive"], context?.previousArchive);
            if (context?.previousNote) {
                queryClient.setQueryData(["note", noteId], context.previousNote);
            }
            console.error("Failed to toggle archive status:", error);
            toast.error("Failed to update archive status");
        }
    });
};

export const useRestoreNoteMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (noteId: string) => {
            const res = await api.patch(`/trash/restore/note/${noteId}`);
            return res.data.note || res.data;
        },

        onMutate: async (noteId) => {
            await queryClient.cancelQueries({ queryKey: ["notes"] });
            await queryClient.cancelQueries({ queryKey: ["notes", "trash"] });

            const previousNotes = queryClient.getQueryData<Note[]>(["notes"]);
            const previousTrash = queryClient.getQueryData<Note[]>(["notes", "trash"]);
            
            const noteToRestore = previousTrash?.find(n => n._id === noteId);

            if (noteToRestore) {
                const restoredPlaceholder = { ...noteToRestore, isArchived: false, isTrashed: false }; // Assuming these fields

                // remove from trash optimistically
                queryClient.setQueryData(["notes", "trash"], (old: Note[] = []) => removeNoteFromList(old, noteId));
                
                // add to active notes optimistically
                queryClient.setQueryData(["notes"], (old: Note[] = []) => addNoteToList(old, restoredPlaceholder));
                
                // update single note
                queryClient.setQueryData(["note", noteId], restoredPlaceholder);
            }

            return { previousNotes, previousTrash };
        },
        onSuccess: (restoredNote, noteId) => {
            // Minimal correction: Just replace the data with server's truth wherever it exists
            queryClient.setQueryData(["note", noteId], restoredNote);
            queryClient.setQueryData(["notes"], (old: Note[] = []) => updateNoteInList(old, restoredNote));
            queryClient.setQueryData(["notes", "trash"], (old: Note[] = []) => updateNoteInList(old, restoredNote));
        },
        onError: (error: any, _noteId, context) => {
            if (error?.response?.status === 404) {
               queryClient.invalidateQueries({ queryKey: ["notes"] });
               queryClient.invalidateQueries({ queryKey: ["notes", "trash"] });
               return;
            }
            queryClient.setQueryData(["notes"], context?.previousNotes);
            queryClient.setQueryData(["notes", "trash"], context?.previousTrash);
            toast.error("Failed to restore note");
        }
    });
};

export const usePermanentDeleteNoteMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (noteId: string) => {
            await api.delete(`/trash/note/${noteId}`);
        },
        onMutate: async (noteId) => {
            await queryClient.cancelQueries({ queryKey: ["notes", "trash"] });

            const previousTrash = queryClient.getQueryData<Note[]>(["notes", "trash"]);

            if (previousTrash) {
                queryClient.setQueryData(["notes", "trash"], (old: Note[] = []) => 
                    removeNoteFromList(old, noteId)
                );
            }

            return { previousTrash };
        },
        onError: (error: any, _noteId, context) => {
            if (error?.response?.status === 404) {
               queryClient.invalidateQueries({ queryKey: ["notes", "trash"] });
               return; 
            }
            queryClient.setQueryData(["notes", "trash"], context?.previousTrash);
            toast.error("Failed to permanently delete note");
        }
    });
};

export const useEmptyTrashMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await api.delete(`/trash/empty`);
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["notes", "trash"] });

            const previousTrash = queryClient.getQueryData<Note[]>(["notes", "trash"]);

            queryClient.setQueryData(["notes", "trash"], []);

            return { previousTrash };
        },
        onError: (_error, _variables, context) => {
            queryClient.setQueryData(["notes", "trash"], context?.previousTrash);
            toast.error("Failed to empty trash");
        }
    });
};

export const useMoveNoteToFolderMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ noteId, folderId, version }: { noteId: string; folderId: string | null; version: number }) => {
            const res = await api.put(`/notes/${noteId}`, {
                folder: folderId,
                version,
            });
            return res.data.updatedNote || res.data.note || res.data;
        },
        onSuccess: (updatedNote, { noteId }) => {
            queryClient.setQueryData(["note", noteId], updatedNote);
            queryClient.invalidateQueries({ queryKey: ["notes"] });
            toast.success(updatedNote.folder ? "Note moved to folder" : "Note moved to All Notes");
        },
        onError: (error) => {
            console.error("Failed to move note:", error);
            toast.error("Failed to move note");
        }
    });
};