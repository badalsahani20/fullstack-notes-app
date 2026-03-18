import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useFolderStore } from "@/store/useFolderStore";
import { useNoteStore } from "@/store/useNoteStore";

const ALL_NOTES_CACHE_KEY = "__all__";

/**
 * useFolderTree controls the logic for the sidebar folder navigation.
 * 
 * Owns:
 * - Data fetching triggers (folders, notes, trash)
 * - Computing counts (favorites, total trash, and notes-per-folder)
 * - Folder expand/collapse state
 * - Lazy loading of folder contents on expansion
 */
export const useFolderTree = () => {
  const { folders, fetchFolders } = useFolderStore();
  const { fetchNotes, fetchNotesForCache, fetchTrash, notesCache, trash } = useNoteStore();
  const { folderId } = useParams();

  const [foldersOpen, setFoldersOpen] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // ── Initial Data Fetches ──────────────────────────────────────────────────
  useEffect(() => {
    fetchFolders();
    fetchNotes(null);
    fetchTrash();
  }, [fetchFolders, fetchNotes, fetchTrash]);

  // Expand the active folder automatically if we navigate directly to it
  useEffect(() => {
    if (!folderId) return;
    setExpandedFolders((current) => ({ ...current, [folderId]: true }));
  }, [folderId]);


  // ── Derived State & Counts ────────────────────────────────────────────────
  const allNotes = useMemo(() => notesCache[ALL_NOTES_CACHE_KEY] ?? [], [notesCache]);

  const countsByFolder = useMemo(() => {
    const counts = new Map<string, number>();
    for (const note of allNotes) {
      if (!note.folder) continue;
      counts.set(note.folder, (counts.get(note.folder) ?? 0) + 1);
    }
    return counts;
  }, [allNotes]);

  const favoritesCount = useMemo(
    () => allNotes.filter((note) => note.pinned).length,
    [allNotes]
  );

  const sortedFolders = useMemo(
    () => [...folders].sort((a, b) => a.name.localeCompare(b.name)),
    [folders]
  );

  // ── Actions ───────────────────────────────────────────────────────────────
  const toggleFoldersGroup = () => {
    setFoldersOpen((current) => !current);
  };

  const toggleFolder = async (id: string) => {
    const nextExpanded = !expandedFolders[id];
    setExpandedFolders((current) => ({ ...current, [id]: nextExpanded }));
    
    // Lazy fetch notes for this folder if opening for the first time
    if (nextExpanded && !notesCache[id]) {
      await fetchNotesForCache(id);
    }
  };

  return {
    allNotes,
    trash,
    notesCache,
    
    sortedFolders,
    foldersOpen,
    expandedFolders,
    
    countsByFolder,
    favoritesCount,
    
    toggleFoldersGroup,
    toggleFolder,
  };
};
