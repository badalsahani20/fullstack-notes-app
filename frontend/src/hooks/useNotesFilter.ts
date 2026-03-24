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

  // ── Filtered note list ───────────────────────────────────────────────────────
  const filteredNotes = useMemo(() => {
    // On the trash route, show the trash array (already all isDeleted: true)
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
      const haystack = stripHtml(`${note.title} ${note.content}`).toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [archivedNotes, folderId, isArchiveRoute, isFavoritesRoute, isTrashRoute, notes, query, trash]);

  // ── Display strings ──────────────────────────────────────────────────────────

  /** The active section name shown on the right side of the breadcrumb */
  const panelTitle = useMemo(() => {
    if (isFavoritesRoute) return "Favorites";
    if (isArchiveRoute)   return "Archive";
    if (isTrashRoute)     return "Trash";
    if (currentFolderName) return currentFolderName;
    return "All Notes";
  }, [currentFolderName, isArchiveRoute, isFavoritesRoute, isTrashRoute]);

  /** The root label on the left side of the breadcrumb */
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
