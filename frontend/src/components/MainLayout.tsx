import { Outlet, useLocation, useParams } from "react-router-dom";
import ActivityBar from "./SideBar";
import NotesListPanel from "./NotesListPanel";
import FoldersPanel from "./folderPanel";

const MainLayout = () => {
  const location = useLocation();
  const { folderId } = useParams();

  const showFolders = location.pathname.startsWith("/folders") || folderId;
  const showNotes =
    location.pathname === "/" || folderId || location.pathname.startsWith("/favorites");

  return (
    <div className="flex h-screen w-full bg-[#0B0B0B] overflow-hidden">
      
      <ActivityBar />

      {showFolders && <FoldersPanel />}

      {showNotes && <NotesListPanel />}

      <main className="flex-1 bg-[#0F0F0F] relative">
        <Outlet />
      </main>

    </div>
  );
};

export default MainLayout;