import type { Folder } from "../store/useFolderStore";
import { cn } from "@/lib/utils";
type FolderCardProps = {
  folder?: Folder
  isActive: boolean
  onClick: () => void
}

const FolderCard = ({folder, isActive, onClick} : FolderCardProps) => {
  if (!folder) return null;

  return (
    <div 
      onClick={onClick}
      className={cn(
                "group text-zinc-900 relative p-4 rounded-xl transition-all cursor-pointer border border-transparent",
                isActive ? "shadow:violet-500 shadow-lg" : "hover:bg-[#252525]"
            )}
    >
      <img src="https:github.com/shadcn.png" alt="" className="w-20 h-20" />
          <h3 className="text-sm font-bold truncate text-white">
              {folder.name || "Untitled"}
          </h3>
      </div>
  );
}

export default FolderCard;