import PanelLayout from "./panelLayout";
import {Plus, Search, PlusCircle } from "lucide-react"
import { useFolderStore } from "@/store/useFolderStore";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import FolderCard from "./folderCard";

const FoldersPanel = () => {
    const { folders, addFolder, fetchFolders } = useFolderStore();
    const { folderId } = useParams();
    const navigate = useNavigate();

    const handleCreate = async () => {
        const name = prompt("New Folder Name: ");
        if (name) await addFolder(name);
    };
    
    useEffect(() => {
        fetchFolders();
    }, [folderId, fetchFolders]);

    return (
        <PanelLayout
            title="NoteBooks"
            actions={
                <>
                <Search size={20} className="text-white hover:text-violet-400 cursor-pointer" />
                <Plus size={20} className="text-white hover:text-violet-400 cursor-pointer" onClick={handleCreate} />
                </>
            }
        >
            {folders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 opacity-20">
                    <p className="text-xs">
                        No notebooks
                    </p>
                    <div className="flex flex-col items-center justify-center rounded-full hover:bg-zinc-400">
                        <PlusCircle size={30} />
                    </div>
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
    )
}

export default FoldersPanel