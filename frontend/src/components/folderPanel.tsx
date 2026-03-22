import { useEffect, useState } from "react";
import {
  Archive,
  ChevronDown,
  ChevronRight,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { Folder as FolderType } from "@/store/useFolderStore";
import { useFolderTree } from "@/hooks/useFolderTree";
import { useFolderStore } from "@/store/useFolderStore";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getFolderIcon } from "@/utils/getFolderIcons";
import { type IconComponent } from "@/utils/getFolderIcons";
import { FolderPanelSkeleton } from "@/components/ui/folderPanelSkeleton";

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
  onRename,
  onDelete,
}: {
  folder: FolderType;
  count: number;
  active: boolean;
  expanded: boolean;
  onToggle: () => void;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
}) => {
  const Icon = getFolderIcon(folder.name);

  return (
    <div className={`sidebar-tree-row sidebar-tree-row-item group ${active ? "sidebar-tree-row-active" : ""}`}>
      <button type="button" onClick={onClick} className="flex min-w-0 flex-1 items-center justify-between">
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
          <span className={`sidebar-link-label truncate ${active ? "sidebar-link-label-active" : ""}`}>{folder.name}</span>
        </span>
        <span className="sidebar-count-pill">{count}</span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={`folder-row-menu-trigger ${active ? "folder-row-menu-trigger-visible" : ""}`}
            aria-label={`Folder actions for ${folder.name}`}
            onClick={(event) => event.stopPropagation()}
          >
            <MoreHorizontal size={14} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              onRename();
            }}
          >
            <Pencil size={14} />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-red-500 focus:text-red-500"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 size={14} />
            Delete folder
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
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

type FolderFormDialogProps = {
  open: boolean;
  mode: "create" | "rename";
  initialValue?: string;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
};

const FolderFormDialog = ({
  open,
  mode,
  initialValue = "",
  isSaving,
  onClose,
  onSubmit,
}: FolderFormDialogProps) => {
  const [name, setName] = useState(initialValue);

  useEffect(() => {
    if (open) {
      setName(initialValue);
    }
  }, [initialValue, open]);

  const trimmedName = name.trim();

  const handleSubmit = async () => {
    if (!trimmedName) return;
    await onSubmit(trimmedName);
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="desktop-dialog">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create folder" : "Rename folder"}</DialogTitle>
          <DialogDescription className="text-[var(--muted-text)]">
            {mode === "create"
              ? "Add a new notebook without breaking the flow."
              : "Update the folder name while keeping everything in place."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="folder-name" className="text-sm font-medium text-[var(--text-strong)]">
            Folder name
          </label>
          <Input
            id="folder-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Design ideas"
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSubmit();
              }
            }}
          />
        </div>

        <DialogFooter className="mt-4 gap-2 sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={!trimmedName || isSaving}>
            {isSaving ? (mode === "create" ? "Creating..." : "Saving...") : mode === "create" ? "Create" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

type FolderDeleteDialogProps = {
  folder: FolderType | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

const FolderDeleteDialog = ({ folder, isDeleting, onCancel, onConfirm }: FolderDeleteDialogProps) => (
  <Dialog open={folder !== null} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
    <DialogContent className="desktop-dialog">
      <DialogHeader>
        <DialogTitle>Delete folder?</DialogTitle>
        <DialogDescription className="text-[var(--muted-text)]">
          {folder
            ? `This will move "${folder.name}" and its notes to trash. You can restore them later from Trash.`
            : "This will move the folder and its notes to trash."}
        </DialogDescription>
      </DialogHeader>

      <DialogFooter className="mt-4 gap-2 sm:justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={() => void onConfirm()} disabled={isDeleting}>
          {isDeleting ? "Deleting..." : "Delete folder"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const FoldersPanel = () => {
  const { folderId, noteId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addFolder, updateFolder, deleteFolder, loading: foldersLoading } = useFolderStore();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<FolderType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FolderType | null>(null);
  const [isSavingFolder, setIsSavingFolder] = useState(false);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);

  const {
    allNotes,
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
  } = useFolderTree();

  const isFavoritesRoute = location.pathname.startsWith("/favorites");
  const isArchiveRoute = location.pathname.startsWith("/archive");
  const isTrashRoute = location.pathname.startsWith("/trash");
  const isAllNotesRoute = !folderId && !isFavoritesRoute && !isArchiveRoute && !isTrashRoute;

  const handleCreateFolder = async (name: string) => {
    setIsSavingFolder(true);
    try {
      const folder = await addFolder(name);
      if (folder?._id) {
        setIsCreateDialogOpen(false);
        navigate(`/folders/${folder._id}`);
      }
    } finally {
      setIsSavingFolder(false);
    }
  };

  const handleRenameFolder = async (folder: FolderType) => {
    setRenameTarget(folder);
  };

  const handleDeleteFolder = async (folder: FolderType) => {
    setDeleteTarget(folder);
  };

  const submitRenameFolder = async (name: string) => {
    if (!renameTarget || name === renameTarget.name) {
      setRenameTarget(null);
      return;
    }

    setIsSavingFolder(true);
    try {
      await updateFolder(renameTarget._id, { name });
      setRenameTarget(null);
    } finally {
      setIsSavingFolder(false);
    }
  };

  const confirmDeleteFolder = async () => {
    if (!deleteTarget) return;

    setIsDeletingFolder(true);
    try {
      await deleteFolder(deleteTarget._id);
      void queryClient.invalidateQueries({ queryKey: ["notes"] });

      if (folderId === deleteTarget._id) {
        navigate(noteId ? `/note/${noteId}` : "/");
      }

      setDeleteTarget(null);
    } finally {
      setIsDeletingFolder(false);
    }
  };



  return (
    <>
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
                onClick={() => setIsCreateDialogOpen(true)}
                aria-label="Create folder"
                title="Create folder"
              >
                <Plus size={15} />
              </button>
            </div>

            {(foldersLoading && sortedFolders.length === 0) || isNotesLoading ? (
              <div className="mt-3">
                <FolderPanelSkeleton />
              </div>
            ) : foldersOpen ? (
              <div className="mt-3 space-y-1">
                {sortedFolders.map((folder) => {
                  const expanded = expandedFolders[folder._id] ?? false;
                  const folderNotes = notesByFolder[folder._id] ?? [];

                  return (
                    <div key={folder._id} className="space-y-1">
                        <FolderRow
                          folder={folder}
                          count={countsByFolder.get(folder._id) ?? 0}
                          active={folderId === folder._id}
                          expanded={expanded}
                          onToggle={() => void toggleFolder(folder._id)}
                          onClick={() => navigate(noteId ? `/folders/${folder._id}/note/${noteId}` : `/folders/${folder._id}`)}
                          onRename={() => void handleRenameFolder(folder)}
                          onDelete={() => void handleDeleteFolder(folder)}
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
          <TopLink label="Trash" count={trashCount} active={isTrashRoute} icon={Trash2} onClick={() => navigate(noteId ? `/trash/note/${noteId}` : "/trash")} />
        </div>
      </div>
      </aside>

      <FolderFormDialog
        open={isCreateDialogOpen}
        mode="create"
        isSaving={isSavingFolder}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateFolder}
      />

      <FolderFormDialog
        open={renameTarget !== null}
        mode="rename"
        initialValue={renameTarget?.name ?? ""}
        isSaving={isSavingFolder}
        onClose={() => setRenameTarget(null)}
        onSubmit={submitRenameFolder}
      />

      <FolderDeleteDialog
        folder={deleteTarget}
        isDeleting={isDeletingFolder}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteFolder}
      />
    </>
  );
};

export default FoldersPanel;
