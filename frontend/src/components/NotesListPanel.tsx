import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import NoteCard from "./noteCard";
import NoteDeleteDialog from "@/components/notes/NoteDeleteDialog";
import NotesPanelHeader from "@/components/notes/NotesPanelHeader";
import NotesPanelSearch from "@/components/notes/NotesPanelSearch";
import { useNotesFilter } from "@/hooks/useNotesFilter";
import { useFolderStore } from "@/store/useFolderStore";
import { useNoteStore, type Note } from "@/store/useNoteStore";


const isRenderableNote = (value: unknown): value is Note => {
  if (!value || typeof value !== "object") return false;
  return typeof (value as Note)._id === "string";
};

const NotesListSkeleton = () => (
  <div className="flex flex-col gap-2 animate-pulse">
    {[1, 2, 3, 4, 5].map((item) => (
      <div
        key={item}
        className="rounded-[1.35rem] border border-[var(--divider)] bg-[var(--surface-muted)] px-4 py-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="h-4 w-32 rounded-full bg-[var(--surface-ghost)]" />
          <div className="h-3 w-12 rounded-full bg-[var(--surface-ghost)]" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full rounded-full bg-[var(--surface-ghost)]" />
          <div className="h-3 w-4/5 rounded-full bg-[var(--surface-ghost)]" />
        </div>
      </div>
    ))}
  </div>
);

const NotesListPanel = () => {
  const { 
    notes, fetchNotes, createNote, softDeleteNote, togglePinning, restoreNote, 
    permanentDeleteNote, emptyTrash, searchQuery, setSearchQuery, archivedNotes, fetchArchived, toggleArchive
  } = useNoteStore();
  const { trash, fetchTrash } = useNoteStore();
  const { folders, fetchFolders } = useFolderStore();
  const { noteId, folderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isFocusMode = searchParams.get("focus") === "1";
  
  const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState<string | null>(null);
  const [isBootstrappingNotes, setIsBootstrappingNotes] = useState(true);

  const closeNoteList = () => {
    const next = new URLSearchParams(location.search);
    next.set("focus", "2");
    navigate(`${location.pathname}?${next.toString()}`, { replace: true });
  };

  const safeNotes = notes.filter(isRenderableNote);

  useEffect(() => {
    let cancelled = false;

    const loadNotes = async () => {
      setIsBootstrappingNotes(true);
      try {
        await fetchNotes(folderId || null);
      } finally {
        if (!cancelled) {
          setIsBootstrappingNotes(false);
        }
      }
    };

    void loadNotes();

    return () => {
      cancelled = true;
    };
  }, [folderId, fetchNotes]);

  useEffect(() => {
    if (folders.length === 0) {
      fetchFolders();
    }
  }, [fetchFolders, folders.length]);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  useEffect(() => {
    fetchArchived();
  }, [fetchArchived]);

  const {
    filteredNotes,
    panelTitle,
    breadcrumbRoot,
    currentFolderName,
    isFavoritesRoute,
    isArchiveRoute,
    isTrashRoute,
  } = useNotesFilter(safeNotes, folders, searchQuery, trash, archivedNotes);
  const isInitialNotesLoad = isBootstrappingNotes && filteredNotes.length === 0;

  const handleCreateNote = async () => {
    const newNote = await createNote(folderId || null);
    if (newNote?._id) {
      const basePath = folderId ? `/folders/${folderId}/note/${newNote._id}` : `/note/${newNote._id}`;
      navigate(`${basePath}${location.search}`);
    }
  };

  const performDeleteNote = async (id: string) => {
    await softDeleteNote(id);
    if (noteId === id) {
      navigate(folderId ? `/folders/${folderId}` : isArchiveRoute ? "/archive" : isFavoritesRoute ? "/favorites" : "/");
    }
  };

  const handleDeleteNote = async (id: string) => {
    setPendingDeleteNoteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteNoteId) return;
    await performDeleteNote(pendingDeleteNoteId);
    setPendingDeleteNoteId(null);
  };

  return (
    <>
      <aside className="desktop-pane mobile-notes-pane">
        <NotesPanelHeader
          breadcrumbRoot={breadcrumbRoot}
          panelTitle={panelTitle}
          currentFolderName={currentFolderName ?? null}
          isFocusMode={isFocusMode}
          actionLabel={isTrashRoute && trash.length > 0 ? "Clear All" : undefined}
          onAction={isTrashRoute && trash.length > 0 ? () => void emptyTrash() : undefined}
          onClose={closeNoteList}
        />

        <NotesPanelSearch
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onCreateNote={handleCreateNote}
          onOpenFavorites={() => navigate(isFavoritesRoute ? "/" : "/favorites")}
          isFavoritesView={isFavoritesRoute}
        />

        <div className="px-4 pb-2 text-sm text-[var(--muted-text)]">Notes ({filteredNotes.length})</div>

        <div className="custom-scrollbar mobile-notes-scroll flex-1 space-y-1.5 overflow-y-auto px-3 pb-4">
          {isInitialNotesLoad ? (
            <NotesListSkeleton />
          ) : filteredNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="empty-pane-message"
            >
              {location.pathname === "/favorites"
                ? "Star a note to keep it here."
                : location.pathname === "/archive"
                  ? "Archive a note to keep it out of your main workspace."
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
                    isTrashView={isTrashRoute}
                    isArchiveView={isArchiveRoute}
                    onClick={() => {
                      if (isTrashRoute) return; // no editor for trashed notes
                      const basePath = folderId
                        ? `/folders/${folderId}/note/${note._id}`
                        : isArchiveRoute
                          ? `/archive/note/${note._id}`
                        : isFavoritesRoute
                          ? `/favorites/note/${note._id}`
                          : `/note/${note._id}`;
                      navigate(`${basePath}${location.search}`);
                    }}
                    onDelete={handleDeleteNote}
                    onRestore={(id: string) => restoreNote(id)}
                    onPermanentDelete={(id: string) => permanentDeleteNote(id)}
                    onTogglePin={togglePinning}
                    onToggleArchive={(id: string) => void toggleArchive(id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </aside>

      <NoteDeleteDialog
        noteId={pendingDeleteNoteId}
        noteTitle={filteredNotes.find((n) => n._id === pendingDeleteNoteId)?.title || "this note"}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteNoteId(null)}
      />
    </>
  );
};

export default NotesListPanel;
