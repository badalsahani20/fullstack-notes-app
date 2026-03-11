import { Outlet, useLocation, useParams } from "react-router-dom";
import ActivityBar from "./SideBar";
import NotesListPanel from "./NotesListPanel";
import FoldersPanel from "./folderPanel";

const MainLayout = () => {
  const location = useLocation();
  const { folderId } = useParams();
  const isFocusMode = new URLSearchParams(location.search).get("focus") === "1";

  const showFolders = !isFocusMode && (location.pathname.startsWith("/folders") || folderId);
  const showNotes =
    !isFocusMode &&
    (location.pathname === "/" ||
      folderId ||
      location.pathname.startsWith("/favorites") ||
      location.pathname.startsWith("/note/"));

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ActivityBar />

      {showFolders && <FoldersPanel />}

      {showNotes && <NotesListPanel />}

      <main className="relative flex-1 overflow-hidden border-l border-white/5 bg-gradient-to-b from-[#1b2132]/70 via-[#171c2a]/65 to-[#131826]/80">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
