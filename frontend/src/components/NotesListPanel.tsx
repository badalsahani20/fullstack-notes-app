import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useNoteStore, type Note } from "@/store/useNoteStore";
import NoteCard from "./noteCard";
import PanelLayout from "./panelLayout";
import { Plus, ListFilter } from "lucide-react";

const isRenderableNote = (value: unknown): value is Note => {
  if (!value || typeof value !== "object") return false;
  return typeof (value as Note)._id === "string";
};

const NotesListPanel = () => {
  const { notes, fetchNotes, createNote, softDeleteNote } = useNoteStore();
  const { noteId, folderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const safeNotes = notes.filter(isRenderableNote);

  const handleCreateNote = async () => {
    const newNote = await createNote(folderId || null);
    if (newNote?._id) {
      navigate(`/note/${newNote._id}`);
    }
  };

  const handleDeleteNote = async (id: string) => {
    await softDeleteNote(id);
    if (noteId === id) {
      navigate("/");
    }
  };

  useEffect(() => {
    fetchNotes(folderId || null);
  }, [folderId, fetchNotes]);

  const getHeaderTitle = () => {
    if (location.pathname === "/trash") return "Trash";
    if (location.pathname === "/favorites") return "Favorites";
    return "All Notes";
  };

  return (
    <PanelLayout
      title={getHeaderTitle()}
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
        <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
          <p className="text-xs text-zinc-400">No notes found. Create one to start writing.</p>
        </div>
      ) : (
        safeNotes.map((note) => (
          <NoteCard
            key={note._id}
            note={note}
            isActive={noteId === note._id}
            onClick={() => navigate(`/note/${note._id}`)}
            onDelete={handleDeleteNote}
          />
        ))
      )}
    </PanelLayout>
  );
};

export default NotesListPanel;
