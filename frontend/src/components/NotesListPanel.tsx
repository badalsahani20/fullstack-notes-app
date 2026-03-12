import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useNoteStore, type Note } from "@/store/useNoteStore";
import { useFolderStore } from "@/store/useFolderStore";
import NoteCard from "./noteCard";
import PanelLayout from "./panelLayout";
import { Plus, ListFilter, Quote, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WRITER_QUOTES } from "@/utils/getQuotes";
const SKIP_NOTE_DELETE_CONFIRM_KEY = "notesify.skipNoteDeleteConfirm";

const isRenderableNote = (value: unknown): value is Note => {
  if (!value || typeof value !== "object") return false;
  return typeof (value as Note)._id === "string";
};

const NotesListPanel = () => {
  const { notes, fetchNotes, createNote, softDeleteNote } = useNoteStore();
  const { folders, fetchFolders } = useFolderStore();
  const { noteId, folderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [panelWidth, setPanelWidth] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState<string | null>(null);
  const [skipDeleteConfirm, setSkipDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const safeNotes = notes.filter(isRenderableNote);
  const isGridView = panelWidth >= 460;
  const emptyFolderQuote = useMemo(() => {
    return WRITER_QUOTES[quoteIndex] ?? WRITER_QUOTES[0];
  }, [quoteIndex]);

  const handleCreateNote = async () => {
    const newNote = await createNote(folderId || null);
    if (newNote?._id) {
      navigate(folderId ? `/folders/${folderId}/note/${newNote._id}` : `/note/${newNote._id}`);
    }
  };

  const performDeleteNote = async (id: string) => {
    setIsDeleting(true);
    await softDeleteNote(id);
    if (noteId === id) {
      navigate(folderId ? `/folders/${folderId}` : "/");
    }
    setIsDeleting(false);
  };

  const handleDeleteNote = async (id: string) => {
    if (skipDeleteConfirm) {
      await performDeleteNote(id);
      return;
    }
    setPendingDeleteNoteId(id);
    setDeleteDialogOpen(true);
  };

  useEffect(() => {
    fetchNotes(folderId || null);
  }, [folderId, fetchNotes]);

  useEffect(() => {
    if (folderId && folders.length === 0) {
      fetchFolders();
    }
  }, [folderId, folders.length, fetchFolders]);

  useEffect(() => {
    if (!panelRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;
      if (!entry) return;
      setPanelWidth(entry.contentRect.width);
    });
    observer.observe(panelRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const savedPreference = window.localStorage.getItem(SKIP_NOTE_DELETE_CONFIRM_KEY);
    setSkipDeleteConfirm(savedPreference === "true");
  }, []);

  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * WRITER_QUOTES.length));
  }, [folderId]);

  const getHeaderTitle = () => {
    if (location.pathname === "/trash") return "Trash";
    if (location.pathname === "/folders") return "Notes";
    if (location.pathname === "/favorites") return "Favorites";
    if (folderId) {
      const currentFolder = folders.find((folder) => folder._id === folderId);
      return currentFolder?.name || "Notes";
    }
    return "All Notes";
  };

  const pendingNote = safeNotes.find((note) => note._id === pendingDeleteNoteId);
  const pendingNoteTitle = pendingNote?.title || "this note";

  const confirmDelete = async () => {
    if (!pendingDeleteNoteId) return;
    if (skipDeleteConfirm) {
      window.localStorage.setItem(SKIP_NOTE_DELETE_CONFIRM_KEY, "true");
    } else {
      window.localStorage.removeItem(SKIP_NOTE_DELETE_CONFIRM_KEY);
    }
    await performDeleteNote(pendingDeleteNoteId);
    setDeleteDialogOpen(false);
    setPendingDeleteNoteId(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setPendingDeleteNoteId(null);
  };

  const showAnotherQuote = () => {
    if (WRITER_QUOTES.length <= 1) return;
    let nextIndex = quoteIndex;
    while (nextIndex === quoteIndex) {
      nextIndex = Math.floor(Math.random() * WRITER_QUOTES.length);
    }
    setQuoteIndex(nextIndex);
  };

  return (
    <>
      <div ref={panelRef} className="h-full">
        <PanelLayout
          title={getHeaderTitle()}
          contentClassName="custom-scrollbar flex-1 overflow-y-auto p-3"
          actions={
            <>
              <button
                onClick={handleCreateNote}
                className="rounded-lg border border-transparent p-1.5 text-zinc-300 transition hover:border-white/10 hover:bg-white/5 hover:text-primary"
                aria-label="Create note"
              >
                <Plus size={18} />
              </button>
              <button
                className="rounded-lg border border-transparent p-1.5 text-zinc-400 transition hover:border-white/10 hover:bg-white/5 hover:text-zinc-100"
                aria-label="Filter notes"
              >
                <ListFilter size={18} />
              </button>
            </>
          }
        >
          {safeNotes.length === 0 ? (
            folderId ? (
              <div className="relative overflow-hidden rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-cyan-500/10 via-sky-400/5 to-transparent p-5 shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
                <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-300/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-14 -left-14 h-32 w-32 rounded-full bg-sky-500/10 blur-2xl" />

                <div className="relative flex items-start justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-zinc-300">
                    <Quote size={12} />
                    WRITERS' CORNER
                  </div>
                  <button
                    onClick={showAnotherQuote}
                    className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/[0.03] px-2 py-1 text-[11px] text-zinc-300 transition hover:border-cyan-300/40 hover:text-cyan-200"
                    aria-label="Show another quote"
                  >
                    <RefreshCw size={12} />
                    New
                  </button>
                </div>

                <p className="relative mt-4 text-[17px] leading-8 text-zinc-100" style={{ fontFamily: "Georgia, Cambria, 'Times New Roman', serif" }}>
                  "{emptyFolderQuote.text}"
                </p>
                <p className="relative mt-3 text-sm font-medium text-cyan-100/90">{emptyFolderQuote.author}</p>
                <p className="relative mt-4 text-xs text-zinc-400">This notebook is waiting for its first line.</p>
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
                <p className="text-xs text-zinc-400">No notes found. Create one to start writing.</p>
              </div>
            )
          ) : (
            <div className={isGridView ? "grid grid-cols-2 gap-3" : "space-y-2"}>
              {safeNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  isActive={noteId === note._id}
                  viewMode={isGridView ? "grid" : "list"}
                  onClick={() => navigate(folderId ? `/folders/${folderId}/note/${note._id}` : `/note/${note._id}`)}
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          )}
        </PanelLayout>
      </div>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setPendingDeleteNoteId(null);
          }
        }}
      >
        <DialogContent className="max-w-md border-white/10 bg-[#101a2b] text-zinc-100">
          <DialogHeader>
            <DialogTitle>Delete note?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This will move "{pendingNoteTitle}" to trash.
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
            <Button variant="outline" onClick={cancelDelete} disabled={isDeleting}>
              Cancel
            </Button>
            <Button onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotesListPanel;
