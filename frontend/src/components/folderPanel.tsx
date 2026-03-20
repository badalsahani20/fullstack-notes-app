import { type ComponentType } from "react";
import {
  Archive,
  ChevronDown,
  ChevronRight,
  FileText,
  Notebook,
  Plane,
  Plus,
  Star,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { Folder as FolderType } from "@/store/useFolderStore";
import { useFolderTree } from "@/hooks/useFolderTree";
import { useFolderStore } from "@/store/useFolderStore";

type IconComponent = ComponentType<{ size?: number; className?: string }>;



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

const FolderPanelSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    <div className="space-y-2">
      {[1, 2].map((item) => (
        <div key={item} className="flex items-center justify-between rounded-2xl border border-[var(--divider)] bg-[var(--surface-muted)] px-3 py-2.5">
          <div className="h-3.5 w-24 rounded-full bg-[var(--surface-ghost)]" />
          <div className="h-5 w-8 rounded-full bg-[var(--surface-ghost)]" />
        </div>
      ))}
    </div>

    <div className="sidebar-divider" />

    <div className="space-y-2">
      {[1, 2, 3].map((item) => (
        <div key={item} className="rounded-2xl border border-[var(--divider)] bg-[var(--surface-muted)] px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-32 rounded-full bg-[var(--surface-ghost)]" />
            <div className="h-5 w-8 rounded-full bg-[var(--surface-ghost)]" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-3 w-24 rounded-full bg-[var(--surface-ghost)]" />
            <div className="h-3 w-20 rounded-full bg-[var(--surface-ghost)]" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FoldersPanel = () => {
  const { folderId, noteId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addFolder, loading: foldersLoading } = useFolderStore();

  const {
    allNotes,
    trash,
    notesCache,
    sortedFolders,
    foldersOpen,
    expandedFolders,
    countsByFolder,
    favoritesCount,
    archiveCount,
    toggleFoldersGroup,
    toggleFolder,
  } = useFolderTree();

  const isFavoritesRoute = location.pathname.startsWith("/favorites");
  const isArchiveRoute = location.pathname.startsWith("/archive");
  const isTrashRoute = location.pathname.startsWith("/trash");
  const isAllNotesRoute = !folderId && !isFavoritesRoute && !isArchiveRoute && !isTrashRoute;

  const handleCreateFolder = async () => {
    const name = window.prompt("Folder name");
    const normalized = name?.trim();
    if (!normalized) return;

    const folder = await addFolder(normalized);
    if (folder?._id) {
      navigate(`/folders/${folder._id}`);
    }
  };



  return (
    <aside className="desktop-pane sidebar-panel">
      <div className="sidebar-content custom-scrollbar mt-1">
        <div className="hidden-on-mobile">
          <div className="sidebar-static-links">
            <TopLink label="All Notes" count={allNotes.length} active={isAllNotesRoute} icon={FileText} onClick={() => navigate(noteId ? `/note/${noteId}` : "/")} />
            <TopLink label="Favorites" count={favoritesCount} active={isFavoritesRoute} icon={Star} onClick={() => navigate(noteId ? `/favorites/note/${noteId}` : "/favorites")} />
          </div>

          <div className="sidebar-divider" />
        </div>

        <div className="sidebar-folders">
          <div className="sidebar-folders-header-row">
            <button type="button" className="sidebar-folders-header" onClick={toggleFoldersGroup}>
              <span className="sidebar-section-title">Notebooks</span>
              <ChevronDown size={15} className={`transition-transform ${foldersOpen ? "rotate-0" : "-rotate-90"}`} />
            </button>
            <button
              type="button"
              className="sidebar-create-folder-button"
              onClick={() => void handleCreateFolder()}
              aria-label="Create folder"
              title="Create folder"
            >
              <Plus size={15} />
            </button>
          </div>

          {foldersLoading && sortedFolders.length === 0 ? (
            <div className="mt-3">
              <FolderPanelSkeleton />
            </div>
          ) : foldersOpen ? (
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
          <TopLink label="Archive" count={archiveCount} active={isArchiveRoute} icon={Archive} onClick={() => navigate(noteId ? `/archive/note/${noteId}` : "/archive")} />
          <TopLink label="Trash" count={trash.length} active={isTrashRoute} icon={Trash2} onClick={() => navigate(noteId ? `/trash/note/${noteId}` : "/trash")} />
        </div>
      </div>
    </aside>
  );
};

export default FoldersPanel;
