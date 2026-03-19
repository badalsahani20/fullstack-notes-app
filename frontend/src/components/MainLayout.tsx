import { useEffect, useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ActivityBar from "./SideBar";
import NotesListPanel from "./NotesListPanel";
import FoldersPanel from "./folderPanel";
import AppHeader from "./AppHeader";
import MobileBottomNav from "./MobileBottomNav";
import MobileCreateButton from "./MobileCreateButton";

const MainLayout = () => {
  const location = useLocation();
  const { noteId, folderId } = useParams();
  const focusParam = new URLSearchParams(location.search).get("focus");
  const isFoldersHidden = focusParam === "1" || focusParam === "2";
  const isNotesHidden = focusParam === "2";
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 960);
  const isSearchRoute = location.pathname.startsWith("/search");
  const isProfileRoute = location.pathname.startsWith("/profile");
  const showGlobalHeader = !(isMobile && Boolean(noteId));
  
  const animationKey = noteId ? `note-${noteId}` : "empty-state";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 960);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showFoldersPanel = isMobile
    ? location.pathname === "/folders" && !folderId && !noteId
    : !isFoldersHidden;
  const showNotesPanel = isMobile
    ? !noteId && !showFoldersPanel && !isSearchRoute && !isProfileRoute
    : !isNotesHidden;
  const showMainPanel = isMobile ? Boolean(noteId) || isSearchRoute || isProfileRoute : true;

  return (
    <div className="app-shell">
      <div className={`app-window ${isMobile ? "mobile-app-window" : ""}`}>
        {showGlobalHeader ? (
          <AppHeader theme={theme} onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))} />
        ) : null}

        <div className="flex min-h-0 flex-1 overflow-hidden">
          {!isMobile ? <ActivityBar /> : null}

          <AnimatePresence initial={false}>
            {showFoldersPanel && (
              <motion.div
                key="folders"
                initial={{ width: 0, opacity: 0, x: isMobile ? -24 : 0 }}
                animate={{ width: isMobile ? "100%" : "15.625rem", opacity: 1, x: 0 }}
                exit={{ width: 0, opacity: 0, x: isMobile ? -24 : 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="h-full shrink-0 overflow-hidden"
              >
                <div className="desktop-folder-column w-full h-full">
                  <FoldersPanel />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {showNotesPanel && (
              <motion.div
                key="notes"
                initial={{ width: 0, opacity: 0, x: isMobile ? 24 : 0 }}
                animate={{ width: isMobile ? "100%" : "24rem", opacity: 1, x: 0 }}
                exit={{ width: 0, opacity: 0, x: isMobile ? 24 : 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="h-full shrink-0 overflow-hidden"
              >
                <div className="desktop-notes-column w-full h-full">
                  <NotesListPanel />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {showMainPanel ? (
            <main className="desktop-main-panel flex-1 relative flex flex-col min-w-0">
              <motion.div
                key={animationKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex-1 h-full min-h-0 flex flex-col"
              >
                <Outlet />
              </motion.div>
            </main>
          ) : null}
        </div>

        {isMobile ? <MobileBottomNav /> : null}
        {isMobile ? <MobileCreateButton /> : null}
      </div>
    </div>
  );
};

export default MainLayout;
