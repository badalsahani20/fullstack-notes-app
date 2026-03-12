import { Search, Plus } from "lucide-react";
import PanelLayout from "./panelLayout";
import { useFolderStore } from "@/store/useFolderStore";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import FolderCard from "./folderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SKIP_FOLDER_DELETE_CONFIRM_KEY = "notesify.skipFolderDeleteConfirm";

const FoldersPanel = () => {
  const { folders, addFolder, deleteFolder, fetchFolders } = useFolderStore();
  const { folderId } = useParams();
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteFolderId, setPendingDeleteFolderId] = useState<string | null>(null);
  const [skipDeleteConfirm, setSkipDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = () => {
    setCreateDialogOpen(true);
  };

  const performDelete = async (id: string) => {
    setIsDeleting(true);
    await deleteFolder(id);
    if (folderId === id) {
      navigate("/folders");
    }
    setIsDeleting(false);
  };

  const handleDelete = async (id: string) => {
    if (skipDeleteConfirm) {
      await performDelete(id);
      return;
    }

    setPendingDeleteFolderId(id);
    setDeleteDialogOpen(true);
  };

  const handleCreateFolderSubmit = async () => {
    const normalized = newFolderName.trim();
    if (!normalized) return;
    setIsCreating(true);
    await addFolder(normalized);
    setIsCreating(false);
    setCreateDialogOpen(false);
    setNewFolderName("");
  };

  const confirmDeleteFolder = async () => {
    if (!pendingDeleteFolderId) return;
    if (skipDeleteConfirm) {
      window.localStorage.setItem(SKIP_FOLDER_DELETE_CONFIRM_KEY, "true");
    } else {
      window.localStorage.removeItem(SKIP_FOLDER_DELETE_CONFIRM_KEY);
    }
    await performDelete(pendingDeleteFolderId);
    setPendingDeleteFolderId(null);
    setDeleteDialogOpen(false);
  };

  const cancelDeleteFolder = () => {
    setPendingDeleteFolderId(null);
    setDeleteDialogOpen(false);
  };

  useEffect(() => {
    fetchFolders();
  }, [folderId, fetchFolders]);

  useEffect(() => {
    const savedPreference = window.localStorage.getItem(SKIP_FOLDER_DELETE_CONFIRM_KEY);
    setSkipDeleteConfirm(savedPreference === "true");
  }, []);

  const pendingFolder = folders.find((folder) => folder._id === pendingDeleteFolderId);
  const pendingFolderName = pendingFolder?.name || "this notebook";

  return (
    <>
      <PanelLayout
        title="Notebooks"
        actions={
          <>
            <button className="rounded-lg border border-transparent p-1.5 text-zinc-400 transition hover:border-white/10 hover:bg-white/5 hover:text-zinc-100" aria-label="Search notebooks">
              <Search size={18} />
            </button>
            <button
              onClick={handleCreate}
              className="rounded-lg border border-transparent p-1.5 text-zinc-300 transition hover:border-white/10 hover:bg-white/5 hover:text-primary"
              aria-label="Create notebook"
            >
              <Plus size={18} />
            </button>
          </>
        }
      >
        {folders.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
            <p className="text-xs text-zinc-400">No notebooks yet. Create your first one.</p>
          </div>
        ) : (
          folders
            .filter((f): f is NonNullable<typeof f> => f != null)
            .map((folder) => (
              <FolderCard
                key={folder._id}
                folder={folder}
                isActive={folderId === folder._id}
                onClick={() => navigate(`/folders/${folder._id}`)}
                onDelete={() => handleDelete(folder._id)}
              />
            ))
        )}
      </PanelLayout>

      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setNewFolderName("");
        }}
      >
        <DialogContent className="max-w-md border-white/10 bg-[#101a2b] text-zinc-100">
          <DialogHeader>
            <DialogTitle>Create notebook</DialogTitle>
            <DialogDescription className="text-zinc-400">Give your notebook a name.</DialogDescription>
          </DialogHeader>
          <Input
            value={newFolderName}
            onChange={(event) => setNewFolderName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleCreateFolderSubmit();
              }
            }}
            placeholder="Notebook name"
            className="border-white/15 bg-white/[0.02] text-zinc-100 placeholder:text-zinc-500"
            autoFocus
          />
          <DialogFooter className="mt-4 gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolderSubmit} disabled={isCreating || !newFolderName.trim()}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setPendingDeleteFolderId(null);
          }
        }}
      >
        <DialogContent className="max-w-md border-white/10 bg-[#101a2b] text-zinc-100">
          <DialogHeader>
            <DialogTitle>Delete notebook?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This will delete "{pendingFolderName}" and all notes inside it.
            </DialogDescription>
          </DialogHeader>

          <label className="mt-2 flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={skipDeleteConfirm}
              onChange={(event) => setSkipDeleteConfirm(event.target.checked)}
              className="h-4 w-4 rounded border border-zinc-500 bg-transparent accent-primary"
            />
            Don't ask again
          </label>

          <DialogFooter className="mt-4 gap-2 sm:justify-end">
            <Button variant="outline" onClick={cancelDeleteFolder} disabled={isDeleting}>
              Cancel
            </Button>
            <Button onClick={confirmDeleteFolder} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FoldersPanel;
