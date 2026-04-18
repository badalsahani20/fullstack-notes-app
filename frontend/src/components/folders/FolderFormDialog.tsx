import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FolderFormDialogProps = {
  open: boolean;
  mode: "create" | "rename";
  initialValue?: string;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
};

export const FolderFormDialog = ({
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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
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

        <form 
          id="folder-form"
          name="folder"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <label htmlFor="folder-name" className="text-sm font-medium text-[var(--text-strong)]">
              Notebook name
            </label>
            <Input
              id="folder-name"
              name="name"
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
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={!trimmedName || isSaving}>
              {isSaving ? (mode === "create" ? "Creating..." : "Saving...") : mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
