import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
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
import { useMoveNoteToFolderMutation } from "@/hooks/useNotesMutations";
import { FolderFormDialog } from "./folders/FolderFormDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getFolderIcon } from "@/utils/getFolderIcons";
import { type IconComponent } from "@/utils/getFolderIcons";
import { FolderPanelSkeleton } from "@/components/ui/folderPanelSkeleton";

const TopLink = ({
  label,
  count,
  active,
  icon: Icon,
  onClick,
  onDrop,
}: {
  label: string;
  count: number;
  active?: boolean;
  icon: IconComponent;
  onClick: () => void;
  onDrop?: (noteId: string, version: number) => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      onDragOver={(e) => {
        if (onDrop) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }
      }}
      onDrop={(e) => {
        if (!onDrop) return;
        const data = e.dataTransfer.getData("application/notesify-note");
        if (data) {
          const { noteId, version } = JSON.parse(data);
          onDrop(noteId, version);
        }
      }}
      className={`sidebar-link-row cursor-pointer ${active ? "sidebar-link-row-active" : ""}`}
    >
      <span className="sidebar-link-main">
        <Icon size={17} className={`sidebar-link-icon ${active ? "sidebar-link-icon-active" : ""}`} />
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
  onDrop,
}: {
  folder: FolderType;
  count: number;
  active: boolean;
  expanded: boolean;
  onToggle: () => void;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
  onDrop: (noteId: string, version: number) => void;
}) => {
  const Icon = getFolderIcon(folder.name);
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      className={cn(
        "sidebar-tree-row sidebar-tree-row-item group",
        active && "sidebar-tree-row-active",
        isOver && "bg-[var(--active-surface)] ring-1 ring-[var(--accent-strong)]"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        setIsOver(false);
        const data = e.dataTransfer.getData("application/notesify-note");
        if (data) {
          const { noteId, version } = JSON.parse(data);
          onDrop(noteId, version);
        }
      }}
    >
      <button type="button" onClick={onClick} className="flex min-w-0 flex-1 items-center justify-between">
        <span className="sidebar-link-main cursor-pointer">
          <span
            className="sidebar-folder-chevron cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
          >
            {expanded ? <ChevronDown size={15} className="text-[var(--muted-text)]" /> : <ChevronRight size={15} className="text-[var(--muted-text)]" />}
          </span>
          <Icon size={17} className={`sidebar-link-icon ${active ? "sidebar-link-icon-active" : ""}`} />
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
            Delete
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
        <FileText size={16} className={`sidebar-link-icon ${active ? "sidebar-link-icon-active" : ""}`} />
        <span className={`sidebar-link-label ${active ? "sidebar-link-label-active" : ""}`}>{title || "Untitled Note"}</span>
      </span>
    </button>
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
        <DialogTitle>Delete Notebook?</DialogTitle>
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
  const { mutate: moveNote } = useMoveNoteToFolderMutation();

  const {
    allNotes,
    notesByFolder,
    sortedFolders,
    foldersOpen,
    expandedFolders,
    countsByFolder,
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
              <TopLink
                label="All Notes"
                count={allNotes.length}
                active={isAllNotesRoute}
                icon={FileText}
                onClick={() => navigate(noteId ? `/note/${noteId}` : "/")}
                onDrop={(id, ver) => moveNote({ noteId: id, folderId: null, version: ver })}
              />
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
                          onDrop={(id, ver) => moveNote({ noteId: id, folderId: folder._id, version: ver })}
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
