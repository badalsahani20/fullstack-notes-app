import { Plus } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useNoteStore } from "@/store/useNoteStore";

const MobileCreateButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { folderId } = useParams();
  const { createNote } = useNoteStore();

  const hideOnRoute =
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/trash") ||
    location.pathname.includes("/note/");

  if (hideOnRoute) return null;

  const handleCreateNote = async () => {
    const targetFolderId = folderId || null;
    const newNote = await createNote(targetFolderId);
    if (newNote?._id) {
      navigate(targetFolderId ? `/folders/${targetFolderId}/note/${newNote._id}` : `/note/${newNote._id}`);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleCreateNote()}
      className="mobile-create-button md:hidden"
      aria-label="Create note"
      title="Create note"
    >
      <Plus size={26} />
    </button>
  );
};

export default MobileCreateButton;
