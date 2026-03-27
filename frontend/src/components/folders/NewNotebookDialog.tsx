import { useState } from "react";
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
import { useFolderStore } from "@/store/useFolderStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type NewNotebookDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const NewNotebookDialog = ({ isOpen, onClose }: NewNotebookDialogProps) => {
  const [name, setName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const { addFolder } = useFolderStore();
  const navigate = useNavigate();

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const normalized = name.trim();
    if (!normalized) return;

    setIsPending(true);
    try {
      const folder = await addFolder(normalized);
      if (folder?._id) {
        toast.success(`Notebook "${normalized}" created`);
        setName("");
        onClose();
        navigate(`/folders/${folder._id}`);
      } else {
        toast.error("Failed to create notebook");
      }
    } catch (error) {
        console.error("Error creating folder:", error);
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Notebook</DialogTitle>
          <DialogDescription>
            Give your notebook a name to stay organized.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="grid gap-4 py-4">
          <Input
            placeholder="Notebook name (e.g., Personal, Work, Ideas)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            disabled={isPending}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "Creating..." : "Create Notebook"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewNotebookDialog;
