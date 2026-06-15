import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import type { Note } from "@/store/useNoteStore";
import type { Folder } from "@/store/useFolderStore";
import { stripHtml } from "@/utils/stripHtml";

export const useNotesFilter = (notes: Note[], folders: Folder[], query: string, trash: Note[] = [], archivedNotes: Note[] = []) => {
  const location = useLocation();
  const { folderId } = useParams();

  // ── Route flags ─────────────────────────────────────────────────────────────
  const isFavoritesRoute = location.pathname.startsWith("/favorites");
  const isArchiveRoute   = location.pathname.startsWith("/archive");
  const isTrashRoute     = location.pathname.startsWith("/trash");

  // ── Folder context ───────────────────────────────────────────────────────────
  const currentFolderName = folderId
    ? folders.find((f) => f._id === folderId)?.name ?? null
    : null;

  // ── Pre-calculate searchable content (Cache) ───────────────────────────────
  // We do this only when the actual notes change, not when the query changes.
  const searchableNotesMap = useMemo(() => {
    const map = new Map<string, string>();
    const allNotes = [...notes, ...trash, ...archivedNotes];
    allNotes.forEach(note => {
      map.set(note._id, stripHtml(`${note.title} ${note.content}`).toLowerCase());
    });
    return map;
  }, [notes, trash, archivedNotes]);

  // ── Filtered note list ───────────────────────────────────────────────────────
  const filteredNotes = useMemo(() => {
    const base = isTrashRoute
      ? trash
      : isArchiveRoute
        ? archivedNotes.filter((note) => !note.isDeleted)
      : isFavoritesRoute
        ? notes.filter((note) => note.pinned && !note.isDeleted)
        : notes.filter((note) =>
            !note.isDeleted &&
            !note.isArchived &&
            (!folderId || note.folder === folderId)
          );

    // Apply text search
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return base;

    return base.filter((note) => {
      const haystack = searchableNotesMap.get(note._id) || "";
      return haystack.includes(normalizedQuery);
    });
  }, [archivedNotes, folderId, isArchiveRoute, isFavoritesRoute, isTrashRoute, notes, query, trash, searchableNotesMap]);

  // ── Display strings ──────────────────────────────────────────────────────────
  const panelTitle = useMemo(() => {
    if (isFavoritesRoute) return "Favorites";
    if (isArchiveRoute)   return "Archive";
    if (isTrashRoute)     return "Trash";
    if (currentFolderName) return currentFolderName;
    return "All Notes";
  }, [currentFolderName, isArchiveRoute, isFavoritesRoute, isTrashRoute]);

  const breadcrumbRoot = useMemo(() => {
    if (isFavoritesRoute) return "Favorites";
    if (isArchiveRoute)   return "Archive";
    if (isTrashRoute)     return "Trash";
    return currentFolderName ? "AI Notes" : "All Notes";
  }, [currentFolderName, isArchiveRoute, isFavoritesRoute, isTrashRoute]);

  return {
    filteredNotes,
    panelTitle,
    breadcrumbRoot,
    currentFolderName,
    isFavoritesRoute,
    isArchiveRoute,
    isTrashRoute,
  };
};
