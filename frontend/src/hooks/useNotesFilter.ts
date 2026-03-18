import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import type { Note } from "@/store/useNoteStore";
import type { Folder } from "@/store/useFolderStore";

/**
 * useNotesFilter — derives everything the notes list panel needs to know
 * about "which notes to show" and "what to call this view".
 *
 * Owned here:
 * - Route detection (favorites / archive / trash / folder)
 * - Note filtering by route + search query
 * - Panel title (shown in the header)
 * - Breadcrumb root (the left side of the breadcrumb)
 * - Current folder name (drives the breadcrumb chevron)
 *
 * @param notes    - Already-sanitized note array from the store
 * @param folders  - Full folder list from the store
 * @param query    - Current search string from the search input
 */
export const useNotesFilter = (notes: Note[], folders: Folder[], query: string) => {
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
    // Step 1: filter by route context
    const base = isTrashRoute
      ? notes.filter((note) => note.isDeleted)
      : isFavoritesRoute
        ? notes.filter((note) => note.pinned && !note.isDeleted)
        : notes.filter((note) => !note.isDeleted);

    // Step 2: apply search query (strips HTML tags before matching)
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return base;

    return base.filter((note) => {
      const haystack = `${note.title} ${note.content}`
        .replace(/<[^>]+>/g, " ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [isFavoritesRoute, isTrashRoute, notes, query]);

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
