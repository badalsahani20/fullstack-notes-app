import { Outlet, useLocation, useParams } from "react-router-dom";
import ActivityBar from "./SideBar";
import NotesListPanel from "./NotesListPanel";
import FoldersPanel from "./folderPanel";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";

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

      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        {showFolders && (
          <>
            <ResizablePanel defaultSize="20%" minSize="16%" maxSize="30%">
              <FoldersPanel />
            </ResizablePanel>
            <ResizableHandle withHandle className="bg-white/10 hover:bg-white/20" />
          </>
        )}

        {showNotes && (
          <>
            <ResizablePanel defaultSize="17%" minSize="16%" maxSize="45%">
              <NotesListPanel />
            </ResizablePanel>
            <ResizableHandle withHandle className="bg-white/10 hover:bg-white/20" />
          </>
        )}

        <ResizablePanel defaultSize={showFolders || showNotes ? "52%" : "100%"} minSize="35%">
          <main className="relative h-full overflow-hidden border-l border-white/5 bg-gradient-to-b from-[#1b2132]/70 via-[#171c2a]/65 to-[#131826]/80">
            <Outlet />
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default MainLayout;
