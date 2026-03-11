import type { Folder } from "../store/useFolderStore";
import { cn } from "@/lib/utils";
import { Folder as FolderIcon } from "lucide-react";

type FolderCardProps = {
  folder?: Folder;
  isActive: boolean;
  onClick: () => void;
};

const FolderCard = ({ folder, isActive, onClick }: FolderCardProps) => {
  if (!folder) return null;

  const initial = folder.name?.charAt(0)?.toUpperCase() ?? "N";

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer rounded-xl border bg-white/[0.02] p-4 transition",
        isActive
          ? "border-primary/50 shadow-[0_10px_24px_rgba(8,24,20,0.28)]"
          : "border-white/8 hover:border-white/20 hover:bg-white/[0.05]"
      )}
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-200">
        <span className="text-sm font-bold">{initial}</span>
      </div>
      <div className="flex items-center gap-2">
        <FolderIcon size={14} className="text-zinc-400" />
        <h3 className="truncate text-sm font-semibold text-zinc-100">{folder.name || "Untitled"}</h3>
      </div>
    </div>
  );
};

export default FolderCard;
