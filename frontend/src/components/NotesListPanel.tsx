import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useNoteStore } from "@/store/useNoteStore";
import NoteCard from "./NoteCard";
import PanelLayout from "./panelLayout"
import { Search, ListFilter } from "lucide-react";

const NotesListPanel = () => {
  const { notes, fetchNotes } = useNoteStore();
  const { noteId, folderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Re-fetch notes whenever the folder changes
  useEffect(() => {
    fetchNotes(folderId || null);
  }, [folderId, fetchNotes]);

  // Determine the header title based on route
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
            <Search size={20} className="text-white hover:text-violet-400 cursor-pointer" />
            <ListFilter size={20} className="text-white hover:text-violet-400 cursor-pointer" />
            </>
        }
    >

        {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 opacity-20">
                <p className="text-xs">
                    No notes found
                </p>
            </div>
        ) : (
            notes.map((note) => (
                <NoteCard 
                    key={note._id}
                    note={note}
                    isActive={noteId === note._id}
                    onClick={() => navigate(`/note/${note._id}`)}
                />
            ))
        )}

    </PanelLayout>
  );
};

export default NotesListPanel;