import { Plus } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const MobileCreateButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { folderId } = useParams();

  const hideOnRoute =
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/trash") ||
    location.pathname.includes("/note/");

  if (hideOnRoute) return null;

  const handleCreateNote = () => {
    const targetFolderId = folderId || null;
    navigate(targetFolderId ? `/folders/${targetFolderId}/note/new` : `/note/new`);
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
