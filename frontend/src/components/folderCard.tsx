import type { Folder } from "../store/useFolderStore";
import { cn } from "@/lib/utils";
import { Notebook, RotateCcw, Trash2, X } from "lucide-react";

type FolderCardProps = {
  folder?: Folder;
  isActive: boolean;
  onClick: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onPermanentDelete?: () => void;
  isTrashView?: boolean;
};

const FolderCard = ({ folder, isActive, onClick, onDelete, onRestore, onPermanentDelete, isTrashView = false }: FolderCardProps) => {
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
        <Notebook size={14} className="text-zinc-400" />
        <h3 className="truncate text-sm font-semibold text-zinc-100">{folder.name || "Untitled"}</h3>
      </div>
      {isTrashView ? (
        <div className="absolute right-3 top-3 flex items-center gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRestore?.();
            }}
            className="rounded-md border border-transparent p-1 text-green-400 transition hover:border-green-400/30 hover:bg-green-500/10 hover:text-green-300"
            aria-label={`Restore ${folder.name || "folder"}`}
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPermanentDelete?.();
            }}
            className="rounded-md border border-transparent p-1 text-red-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
            aria-label={`Delete ${folder.name || "folder"} permanently`}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete?.();
          }}
          className="absolute right-3 top-3 rounded-md border border-transparent p-1 text-zinc-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
          aria-label={`Delete ${folder.name || "folder"}`}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};

export default FolderCard;
