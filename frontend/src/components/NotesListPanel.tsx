import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import NoteCard from "./noteCard";
import FolderCard from "./folderCard";
import NoteDeleteDialog, { SKIP_NOTE_DELETE_CONFIRM_KEY } from "@/components/notes/NoteDeleteDialog";
import NotesPanelHeader from "@/components/notes/NotesPanelHeader";
import NotesPanelSearch from "@/components/notes/NotesPanelSearch";
import { useNotesFilter } from "@/hooks/useNotesFilter";
import { useFolderStore } from "@/store/useFolderStore";
import { useNoteStore, type Note, type TrashFolder } from "@/store/useNoteStore";
import { NotesListSkeleton } from "@/components/ui/notesListSkeleton";
import { useNotesQuery, useTrashQuery, useArchivedQuery } from "@/hooks/useNotesQuery";
import { 
  useCreateNoteMutation, 
  useDeleteNoteMutation,
  usePermanentDeleteNoteMutation,
  useEmptyTrashMutation,
  useRestoreNoteMutation,
  useTogglePinMutation,
  useToggleArchiveMutation
} from "@/hooks/useNotesMutations";

const isRenderableNote = (value: unknown): value is Note => {
  if (!value || typeof value !== "object") return false;
  return typeof (value as Note)._id === "string";
};

const NotesListPanel = () => {
  const { searchQuery, setSearchQuery } = useNoteStore();

  const { mutateAsync : createNoteAsync, isPending : isCreateNotePending } = useCreateNoteMutation();
  const { mutateAsync : deleteNoteAsync, isPending : isDeleteNotePending } = useDeleteNoteMutation();
  const { mutateAsync : togglePinning } = useTogglePinMutation();
  const { mutateAsync : restoreNote } = useRestoreNoteMutation();
  const { mutateAsync : permanentDeleteNote } = usePermanentDeleteNoteMutation();
  const { mutateAsync : emptyTrash } = useEmptyTrashMutation();
  const { mutateAsync : toggleArchive } = useToggleArchiveMutation();

  const trashFolders: TrashFolder[] = [];
  const restoreFolder = async (id: string) => {};
  const permanentDeleteFolder = async (id: string) => {};

  const { folders, hasFetched: hasFetchedFolders } = useFolderStore();
  const { noteId, folderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isFocusMode = searchParams.get("focus") === "1";
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState<string | null>(null);
  const { data: queryNotes = [], isLoading: isNotesLoading, isError: isNoteError, error: notesError } = useNotesQuery();
  const { data: trash = [], isLoading: isTrashLoading } = useTrashQuery();
  const { data: archivedNotes = [], isLoading: isArchiveLoading } = useArchivedQuery();

  const closeNoteList = () => {
    const next = new URLSearchParams(location.search);
    next.set("focus", "2");
    navigate(`${location.pathname}?${next.toString()}`, { replace: true });
  };

  const safeNotes = queryNotes.filter(isRenderableNote);

  const {
    filteredNotes,
    panelTitle,
    breadcrumbRoot,
    currentFolderName,
    isFavoritesRoute,
    isArchiveRoute,
    isTrashRoute,
  } = useNotesFilter(safeNotes, folders, searchQuery, trash, archivedNotes);
  const isInitialNotesLoad = isTrashRoute
    ? isTrashLoading
    : isArchiveRoute
      ? isArchiveLoading
      : isNotesLoading || !hasFetchedFolders;
  const currentSelectedNote = useMemo(
    () => [...safeNotes, ...archivedNotes, ...trash].find((item) => item._id === noteId) ?? null,
    [archivedNotes, noteId, safeNotes, trash]
  );
  const headerBreadcrumbRoot = currentFolderName ?? breadcrumbRoot;
  const headerPanelTitle = currentFolderName && currentSelectedNote?.title
    ? currentSelectedNote.title || "Untitled note"
    : panelTitle;
  const headerShowChevron = Boolean(
    currentFolderName ||
    isFavoritesRoute ||
    isArchiveRoute ||
    isTrashRoute
  );
  const filteredTrashFolders = useMemo(() => {
    if (!isTrashRoute) return [];
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return trashFolders;
    return trashFolders.filter((folder) => folder.name.toLowerCase().includes(normalizedQuery));
  }, [isTrashRoute, searchQuery, trashFolders]);


  const combinedTrashItems = useMemo(() => {
    if (!isTrashRoute) return [];
    return [
      ...filteredNotes.map((note) => ({ type: "note" as const, updatedAt: note.updatedAt, item: note })),
      ...filteredTrashFolders.map((folder) => ({ type: "folder" as const, updatedAt: folder.updatedAt, item: folder })),
    ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [filteredNotes, filteredTrashFolders, isTrashRoute]);
  const totalTrashCount = trash.length + trashFolders.length;
  const currentNoteIndex = useMemo(
    () => filteredNotes.findIndex((item) => item._id === noteId),
    [filteredNotes, noteId]
  );

  const handleCreateNote = async () => {
    const newNote = await createNoteAsync(folderId || null);
    if (newNote?._id) {
      const basePath = folderId ? `/folders/${folderId}/note/${newNote._id}` : `/note/${newNote._id}`;
      navigate(`${basePath}${location.search}`);
    }
  };

  const performDeleteNote = async (id: string) => {
    const noteToDelete = safeNotes.find((n) => n._id === id);
    if (noteToDelete) {
      await deleteNoteAsync({ noteId: id, version: noteToDelete.version });
    }
    if (noteId === id) {
      navigate(folderId ? `/folders/${folderId}` : isArchiveRoute ? "/archive" : isFavoritesRoute ? "/favorites" : "/");
    }
  };

  const handleDeleteNote = async (id: string) => {
    const skipConfirm = window.localStorage.getItem(SKIP_NOTE_DELETE_CONFIRM_KEY) === "true";
    if (skipConfirm) {
      await performDeleteNote(id);
    } else {
      setPendingDeleteNoteId(id);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteNoteId) return;
    await performDeleteNote(pendingDeleteNoteId);
    setPendingDeleteNoteId(null);
  };

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return Boolean(target.closest("input, textarea, [contenteditable='true'], .ProseMirror"));
    };

    const openNoteAtIndex = (index: number) => {
      const target = filteredNotes[index];
      if (!target || isTrashRoute) return;

      const basePath = folderId
        ? `/folders/${folderId}/note/${target._id}`
        : isArchiveRoute
          ? `/archive/note/${target._id}`
          : isFavoritesRoute
            ? `/favorites/note/${target._id}`
            : `/note/${target._id}`;
      navigate(`${basePath}${location.search}`);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if (isTypingTarget(event.target) || filteredNotes.length === 0 || isTrashRoute) {
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const delta = event.key === "ArrowDown" ? 1 : -1;
        const nextIndex = currentNoteIndex >= 0
          ? Math.min(filteredNotes.length - 1, Math.max(0, currentNoteIndex + delta))
          : delta > 0
            ? 0
            : filteredNotes.length - 1;
        openNoteAtIndex(nextIndex);
        return;
      }

      if (event.key === "Enter" && currentNoteIndex >= 0) {
        event.preventDefault();
        openNoteAtIndex(currentNoteIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentNoteIndex,
    filteredNotes,
    folderId,
    isArchiveRoute,
    isFavoritesRoute,
    isTrashRoute,
    location.search,
    navigate,
  ]);

  const shouldShowNotesError = isNoteError && !isTrashRoute && !isArchiveRoute && !isFavoritesRoute;
  const notesErrorMessage = notesError instanceof Error ? notesError.message : "Failed to load notes";
  return (
    <>
      <aside className="desktop-pane mobile-notes-pane">
        <NotesPanelHeader
          breadcrumbRoot={headerBreadcrumbRoot}
          panelTitle={headerPanelTitle}
          showChevron={headerShowChevron}
          isFocusMode={isFocusMode}
          actionLabel={isTrashRoute && totalTrashCount > 0 ? "Clear All" : undefined}
          onAction={isTrashRoute && totalTrashCount > 0 ? () => void emptyTrash() : undefined}
          onClose={closeNoteList}
        />

        <NotesPanelSearch
          ref={searchInputRef}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onCreateNote={handleCreateNote}
          isPending={isCreateNotePending}
          onOpenFavorites={() => navigate(isFavoritesRoute ? "/" : "/favorites")}
          isFavoritesView={isFavoritesRoute}
        />

        <div className="px-4 pb-2 text-sm text-[var(--muted-text)]">
          {isTrashRoute ? `Trash (${combinedTrashItems.length})` : `Notes (${filteredNotes.length})`}
        </div>

        <div className="custom-scrollbar mobile-notes-scroll flex-1 space-y-1.5 overflow-y-auto px-3 pb-4">
          {isInitialNotesLoad ? (
            <NotesListSkeleton />
          ) : shouldShowNotesError ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="empty pane message"
            >
              {notesErrorMessage}
            </motion.div>
          ) : (isTrashRoute ? combinedTrashItems.length === 0 : filteredNotes.length === 0) ? (
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
                {isTrashRoute
                  ? combinedTrashItems.map((entry) =>
                    entry.type === "note" ? (
                      <NoteCard
                        key={`trash-note-${entry.item._id}`}
                        note={entry.item}
                        isActive={false}
                        isTrashView
                        isArchiveView={false}
                        onClick={() => { }}
                        onRestore={(id: string) => restoreNote(id)}
                        onPermanentDelete={(id: string) => permanentDeleteNote(id)}
                      />
                    ) : (
                      <FolderCard
                        key={`trash-folder-${entry.item._id}`}
                        folder={entry.item as TrashFolder}
                        isActive={false}
                        isTrashView
                        onClick={() => { }}
                        onRestore={() => void restoreFolder(entry.item._id)}
                        onPermanentDelete={() => void permanentDeleteFolder(entry.item._id)}
                      />
                    )
                  )
                  : filteredNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      isActive={noteId === note._id}
                      isTrashView={false}
                      isArchiveView={isArchiveRoute}
                      onClick={() => {
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
                      onTogglePin={(id: string) => void togglePinning({ noteId: id, version: note.version })}
                      onToggleArchive={(id: string) => void toggleArchive({ noteId: id, version: note.version })}
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
        isPending={isDeleteNotePending}
      />
    </>
  );
};

export default NotesListPanel;
