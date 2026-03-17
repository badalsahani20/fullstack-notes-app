import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  Archive,
  ChevronDown,
  ChevronRight,
  FileText,
  Notebook,
  Plane,
  Star,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useFolderStore, type Folder as FolderType } from "@/store/useFolderStore";
import { useNoteStore } from "@/store/useNoteStore";

type IconComponent = ComponentType<{ size?: number; className?: string }>;

const ALL_NOTES_CACHE_KEY = "__all__";

const getFolderIcon = (name: string): IconComponent => {
  if (/travel/i.test(name)) return Plane;
  if (/recipe/i.test(name)) return UtensilsCrossed;
  return Notebook;
};

const TopLink = ({
  label,
  count,
  active,
  icon: Icon,
  onClick,
}: {
  label: string;
  count: number;
  active?: boolean;
  icon: IconComponent;
  onClick: () => void;
}) => {
  return (
    <button type="button" onClick={onClick} className={`sidebar-link-row ${active ? "sidebar-link-row-active" : ""}`}>
      <span className="sidebar-link-main">
        <Icon size={15} className={`sidebar-link-icon ${active ? "sidebar-link-icon-active" : ""}`} />
        <span className={`sidebar-link-label ${active ? "sidebar-link-label-active" : ""}`}>{label}</span>
      </span>
      <span className="sidebar-count-pill">{count}</span>
    </button>
  );
};

const FolderRow = ({
  folder,
  count,
  active,
  expanded,
  onToggle,
  onClick,
}: {
  folder: FolderType;
  count: number;
  active: boolean;
  expanded: boolean;
  onToggle: () => void;
  onClick: () => void;
}) => {
  const Icon = getFolderIcon(folder.name);

  return (
    <button type="button" onClick={onClick} className={`sidebar-tree-row sidebar-tree-row-item ${active ? "sidebar-tree-row-active" : ""}`}>
      <span className="sidebar-link-main">
        <span
          className="sidebar-folder-chevron"
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
        >
          {expanded ? <ChevronDown size={14} className="text-[var(--muted-text)]" /> : <ChevronRight size={14} className="text-[var(--muted-text)]" />}
        </span>
        <Icon size={15} className={`sidebar-link-icon ${active ? "sidebar-link-icon-active" : ""}`} />
        <span className={`sidebar-link-label ${active ? "sidebar-link-label-active" : ""}`}>{folder.name}</span>
      </span>
      <span className="sidebar-count-pill">{count}</span>
    </button>
  );
};

const NoteChildRow = ({
  title,
  active,
  onClick,
}: {
  title: string;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <button type="button" onClick={onClick} className={`sidebar-note-child ${active ? "sidebar-note-child-active" : ""}`}>
      <span className="sidebar-link-main">
        <FileText size={14} className={`sidebar-link-icon ${active ? "sidebar-link-icon-active" : ""}`} />
        <span className={`sidebar-link-label ${active ? "sidebar-link-label-active" : ""}`}>{title || "Untitled Note"}</span>
      </span>
    </button>
  );
};

const FoldersPanel = () => {
  const { folders, fetchFolders } = useFolderStore();
  const { fetchNotes, fetchNotesForCache, fetchTrash, notesCache, trash } = useNoteStore();
  const { folderId, noteId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const isFavoritesRoute = location.pathname.startsWith("/favorites");
  const isArchiveRoute = location.pathname.startsWith("/archive");
  const isTrashRoute = location.pathname.startsWith("/trash");
  const isAllNotesRoute = !folderId && !isFavoritesRoute && !isArchiveRoute && !isTrashRoute;

  useEffect(() => {
    fetchFolders();
    fetchNotes(null);
    fetchTrash();
  }, [fetchFolders, fetchNotes, fetchTrash]);

  const allNotes = useMemo(() => notesCache[ALL_NOTES_CACHE_KEY] ?? [], [notesCache]);

  const countsByFolder = useMemo(() => {
    const counts = new Map<string, number>();

    for (const note of allNotes) {
      if (!note.folder) continue;
      counts.set(note.folder, (counts.get(note.folder) ?? 0) + 1);
    }

    return counts;
  }, [allNotes]);

  const favoritesCount = useMemo(() => allNotes.filter((note) => note.pinned).length, [allNotes]);

  const sortedFolders = useMemo(() => [...folders].sort((a, b) => a.name.localeCompare(b.name)), [folders]);

  useEffect(() => {
    if (!folderId) return;
    setExpandedFolders((current) => ({ ...current, [folderId]: true }));
  }, [folderId]);

  const toggleFolder = async (id: string) => {
    const nextExpanded = !expandedFolders[id];
    setExpandedFolders((current) => ({ ...current, [id]: nextExpanded }));
    if (nextExpanded && !notesCache[id]) {
      await fetchNotesForCache(id);
    }
  };

  return (
    <aside className="desktop-pane sidebar-panel">
      <div className="sidebar-content custom-scrollbar mt-1">
        <div className="sidebar-static-links">
          <TopLink label="All Notes" count={allNotes.length} active={isAllNotesRoute} icon={FileText} onClick={() => navigate(noteId ? `/note/${noteId}` : "/")} />
          <TopLink label="Favorites" count={favoritesCount} active={isFavoritesRoute} icon={Star} onClick={() => navigate(noteId ? `/favorites/note/${noteId}` : "/favorites")} />
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-folders">
          <button type="button" className="sidebar-folders-header" onClick={() => setFoldersOpen((current) => !current)}>
            <span className="sidebar-section-title">Notebooks</span>
            <ChevronDown size={15} className={`transition-transform ${foldersOpen ? "rotate-0" : "-rotate-90"}`} />
          </button>

          {foldersOpen ? (
            <div className="mt-3 space-y-1">
              {sortedFolders.map((folder) => {
                const expanded = expandedFolders[folder._id] ?? false;
                const folderNotes = notesCache[folder._id] ?? [];

                return (
                  <div key={folder._id} className="space-y-1">
                      <FolderRow
                        folder={folder}
                        count={countsByFolder.get(folder._id) ?? 0}
                        active={folderId === folder._id}
                        expanded={expanded}
                        onToggle={() => void toggleFolder(folder._id)}
                        onClick={() => navigate(noteId ? `/folders/${folder._id}/note/${noteId}` : `/folders/${folder._id}`)}
                      />

                    <div className={`sidebar-folder-children ${expanded ? "sidebar-folder-children-open" : ""}`}>
                      <div className="sidebar-folder-children-inner space-y-1">
                        {folderNotes.length > 0 ? (
                          folderNotes.map((note) => (
                            <NoteChildRow
                              key={note._id}
                              title={note.title}
                              active={noteId === note._id}
                              onClick={() => navigate(`/folders/${folder._id}/note/${note._id}`)}
                            />
                          ))
                        ) : (
                          <div className="sidebar-empty-folder">0 notes</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-bottom-links">
          <TopLink label="Archive" count={0} active={isArchiveRoute} icon={Archive} onClick={() => navigate(noteId ? `/archive/note/${noteId}` : "/archive")} />
          <TopLink label="Trash" count={trash.length} active={isTrashRoute} icon={Trash2} onClick={() => navigate(noteId ? `/trash/note/${noteId}` : "/trash")} />
        </div>
      </div>
    </aside>
  );
};

export default FoldersPanel;
