import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Plus, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import NoteCard from "./noteCard";
import { useFolderStore } from "@/store/useFolderStore";
import { useNoteStore, type Note } from "@/store/useNoteStore";

const SKIP_NOTE_DELETE_CONFIRM_KEY = "notesify.skipNoteDeleteConfirm";

const isRenderableNote = (value: unknown): value is Note => {
  if (!value || typeof value !== "object") return false;
  return typeof (value as Note)._id === "string";
};

const NotesListPanel = () => {
  const { notes, fetchNotes, createNote, softDeleteNote, togglePinning } = useNoteStore();
  const { folders, fetchFolders } = useFolderStore();
  const { noteId, folderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState<string | null>(null);
  const [skipDeleteConfirm, setSkipDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [query, setQuery] = useState("");

  const safeNotes = notes.filter(isRenderableNote);

  useEffect(() => {
    fetchNotes(folderId || null);
  }, [folderId, fetchNotes]);

  useEffect(() => {
    if (folders.length === 0) {
      fetchFolders();
    }
  }, [fetchFolders, folders.length]);

  useEffect(() => {
    const savedPreference = window.localStorage.getItem(SKIP_NOTE_DELETE_CONFIRM_KEY);
    setSkipDeleteConfirm(savedPreference === "true");
  }, []);

  const isFavoritesRoute = location.pathname.startsWith("/favorites");
  const isArchiveRoute = location.pathname.startsWith("/archive");
  const isTrashRoute = location.pathname.startsWith("/trash");

  const filteredNotes = useMemo(() => {
    const base = isFavoritesRoute ? safeNotes.filter((note) => note.pinned) : safeNotes;

    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return base;

    return base.filter((note) => {
      const haystack = `${note.title} ${note.content}`.replace(/<[^>]+>/g, " ").toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [isFavoritesRoute, query, safeNotes]);

  const pendingNote = safeNotes.find((note) => note._id === pendingDeleteNoteId);
  const pendingNoteTitle = pendingNote?.title || "this note";

  const currentFolderName = folderId ? folders.find((folder) => folder._id === folderId)?.name : null;

  const panelTitle = useMemo(() => {
    if (isFavoritesRoute) return "Favorites";
    if (isArchiveRoute) return "Archive";
    if (isTrashRoute) return "Trash";
    if (currentFolderName) return currentFolderName;
    return "All Notes";
  }, [currentFolderName, isArchiveRoute, isFavoritesRoute, isTrashRoute]);

  const breadcrumbRoot = useMemo(() => {
    if (isFavoritesRoute) return "Favorites";
    if (isArchiveRoute) return "Archive";
    if (isTrashRoute) return "Trash";
    return currentFolderName ? "AI Notes" : "All Notes";
  }, [currentFolderName, isArchiveRoute, isFavoritesRoute, isTrashRoute]);

  const handleCreateNote = async () => {
    const newNote = await createNote(folderId || null);
    if (newNote?._id) {
      navigate(folderId ? `/folders/${folderId}/note/${newNote._id}` : `/note/${newNote._id}`);
    }
  };

  const performDeleteNote = async (id: string) => {
    setIsDeleting(true);
    await softDeleteNote(id);
    if (noteId === id) {
      navigate(folderId ? `/folders/${folderId}` : isFavoritesRoute ? "/favorites" : "/");
    }
    setIsDeleting(false);
  };

  const handleDeleteNote = async (id: string) => {
    if (skipDeleteConfirm) {
      await performDeleteNote(id);
      return;
    }
    setPendingDeleteNoteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteNoteId) return;
    if (skipDeleteConfirm) {
      window.localStorage.setItem(SKIP_NOTE_DELETE_CONFIRM_KEY, "true");
    } else {
      window.localStorage.removeItem(SKIP_NOTE_DELETE_CONFIRM_KEY);
    }
    await performDeleteNote(pendingDeleteNoteId);
    setDeleteDialogOpen(false);
    setPendingDeleteNoteId(null);
  };

  return (
    <>
      <aside className="desktop-pane">
        <div className="notes-panel-header">
          <div className="notes-panel-breadcrumb">
            <span>{breadcrumbRoot}</span>
            {currentFolderName ? (
              <>
                <ChevronRight size={14} />
                <span className="notes-panel-breadcrumb-active">{panelTitle}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className="notes-panel-search">
            <Search size={16} className="text-[var(--muted-text)]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search notes..."
              className="notes-panel-search-input"
            />
            <button type="button" className="notes-panel-plus-button" aria-label="Create note" onClick={handleCreateNote}>
              <Plus size={15} />
            </button>
          </div>
        </div>

        <div className="px-4 pb-2 text-sm text-[var(--muted-text)]">Notes ({filteredNotes.length})</div>

        <div className="custom-scrollbar flex-1 space-y-1.5 overflow-y-auto px-3 pb-4">
          {filteredNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="empty-pane-message"
            >
              {location.pathname === "/favorites"
                ? "Star a note to keep it here."
                : "No notes match this view yet. Create one to start filling the workspace."}
            </motion.div>
          ) : (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.04 },
                },
              }}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-1.5"
            >
              <AnimatePresence mode="popLayout">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    isActive={noteId === note._id}
                    onClick={() =>
                      navigate(
                        folderId
                          ? `/folders/${folderId}/note/${note._id}`
                          : isFavoritesRoute
                            ? `/favorites/note/${note._id}`
                            : `/note/${note._id}`
                      )
                    }
                    onDelete={handleDeleteNote}
                    onTogglePin={togglePinning}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </aside>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setPendingDeleteNoteId(null);
          }
        }}
      >
        <DialogContent className="desktop-dialog">
          <DialogHeader>
            <DialogTitle>Delete note?</DialogTitle>
            <DialogDescription className="text-[var(--muted-text)]">
              This will move "{pendingNoteTitle}" to trash.
            </DialogDescription>
          </DialogHeader>

          <label className="mt-2 flex items-center gap-2 text-sm text-[var(--text-strong)]">
            <input
              type="checkbox"
              checked={skipDeleteConfirm}
              onChange={(event) => setSkipDeleteConfirm(event.target.checked)}
              className="h-4 w-4 rounded border border-[var(--divider)] bg-transparent accent-[var(--accent-strong)]"
            />
            Don't ask again
          </label>

          <DialogFooter className="mt-4 gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotesListPanel;
