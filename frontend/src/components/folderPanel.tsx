import { Search, Plus } from "lucide-react";
import PanelLayout from "./panelLayout";
import { useFolderStore } from "@/store/useFolderStore";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import FolderCard from "./folderCard";

const FoldersPanel = () => {
  const { folders, addFolder, fetchFolders } = useFolderStore();
  const { folderId } = useParams();
  const navigate = useNavigate();

  const handleCreate = async () => {
    const name = prompt("New notebook name:");
    if (name) await addFolder(name.trim());
  };

  useEffect(() => {
    fetchFolders();
  }, [folderId, fetchFolders]);

  return (
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
            />
          ))
      )}
    </PanelLayout>
  );
};

export default FoldersPanel;
