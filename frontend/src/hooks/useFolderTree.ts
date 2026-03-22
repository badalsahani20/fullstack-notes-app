import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useFolderStore } from "@/store/useFolderStore";
import { useNotesQuery, useTrashQuery, useArchivedQuery } from "@/hooks/useNotesQuery";

/**
 * useFolderTree controls the logic for the sidebar folder navigation.
 *
 * Owned here:
 * - Computing counts (favorites, total trash, and notes-per-folder)
 * - Folder expand/collapse state
 */
export const useFolderTree = () => {
  const { folders } = useFolderStore();
  const { data: notes = [], isLoading: isNotesLoading } = useNotesQuery();
  const { data: trash = [] } = useTrashQuery();
  const { data: archivedNotes = [] } = useArchivedQuery();
  const trashFolders: any[] = [];
  const { folderId } = useParams();

  const [foldersOpen, setFoldersOpen] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!folderId) return;
    setExpandedFolders((current) => ({ ...current, [folderId]: true }));
  }, [folderId]);

  const allNotes = useMemo(
    () => notes.filter((note) => !note.isDeleted && !note.isArchived),
    [notes]
  );

  const notesByFolder = useMemo(() => {
    return allNotes.reduce<Record<string, typeof allNotes>>((acc, note) => {
      if (!note.folder) return acc;
      acc[note.folder] = [...(acc[note.folder] ?? []), note];
      return acc;
    }, {});
  }, [allNotes]);

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

  const archiveCount = useMemo(() => archivedNotes.length, [archivedNotes]);
  const trashCount = useMemo(
    () => trash.length + trashFolders.length,
    [trash.length, trashFolders.length]
  );

  const sortedFolders = useMemo(
    () => [...folders].sort((a, b) => a.name.localeCompare(b.name)),
    [folders]
  );

  const toggleFoldersGroup = () => {
    setFoldersOpen((current) => !current);
  };

  const toggleFolder = (id: string) => {
    const nextExpanded = !expandedFolders[id];
    setExpandedFolders((current) => ({ ...current, [id]: nextExpanded }));
  };

  return {
    allNotes,
    trash,
    notesByFolder,
    sortedFolders,
    foldersOpen,
    expandedFolders,
    countsByFolder,
    favoritesCount,
    archiveCount,
    trashCount,
    toggleFoldersGroup,
    toggleFolder,
    isNotesLoading,
  };
};
