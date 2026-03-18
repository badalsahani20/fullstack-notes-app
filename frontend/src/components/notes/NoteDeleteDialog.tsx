import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SKIP_NOTE_DELETE_CONFIRM_KEY = "notesify.skipNoteDeleteConfirm";

type NoteDeleteDialogProps = {
  /** The note id waiting to be deleted, or null when dialog is closed */
  noteId: string | null;
  /** Title of the note — shown in the confirmation message */
  noteTitle: string;
  /** Called when the user confirms deletion */
  onConfirm: () => Promise<void>;
  /** Called when the user cancels or closes the dialog */
  onCancel: () => void;
};

/**
 * Delete confirmation dialog for notes.
 *
 * Owns:
 * - The "don't ask again" checkbox preference (reads/writes localStorage)
 * - The deleting loading state
 * - All dialog UI
 *
 * The parent only needs to pass `noteId` (null = closed) and `onConfirm`.
 */
const NoteDeleteDialog = ({ noteId, noteTitle, onConfirm, onCancel }: NoteDeleteDialogProps) => {
  const [skipConfirm, setSkipConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Read the saved "don't ask again" preference from localStorage on mount
  useEffect(() => {
    const saved = window.localStorage.getItem(SKIP_NOTE_DELETE_CONFIRM_KEY);
    setSkipConfirm(saved === "true");
  }, []);

  const handleConfirm = async () => {
    // Persist the checkbox preference
    if (skipConfirm) {
      window.localStorage.setItem(SKIP_NOTE_DELETE_CONFIRM_KEY, "true");
    } else {
      window.localStorage.removeItem(SKIP_NOTE_DELETE_CONFIRM_KEY);
    }

    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  return (
    <Dialog
      open={noteId !== null}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className="desktop-dialog">
        <DialogHeader>
          <DialogTitle>Delete note?</DialogTitle>
          <DialogDescription className="text-[var(--muted-text)]">
            This will move &quot;{noteTitle}&quot; to trash.
          </DialogDescription>
        </DialogHeader>

        <label className="mt-2 flex items-center gap-2 text-sm text-[var(--text-strong)]">
          <input
            type="checkbox"
            checked={skipConfirm}
            onChange={(e) => setSkipConfirm(e.target.checked)}
            className="h-4 w-4 rounded border border-[var(--divider)] bg-transparent accent-[var(--accent-strong)]"
          />
          Don&apos;t ask again
        </label>

        <DialogFooter className="mt-4 gap-2 sm:justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { SKIP_NOTE_DELETE_CONFIRM_KEY };
export default NoteDeleteDialog;
