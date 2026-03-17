import { useEffect, useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ActivityBar from "./SideBar";
import NotesListPanel from "./NotesListPanel";
import FoldersPanel from "./folderPanel";
import AppHeader from "./AppHeader";

const MainLayout = () => {
  const location = useLocation();
  const { noteId } = useParams();
  const isFocusMode = new URLSearchParams(location.search).get("focus") === "1";
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  
  const animationKey = noteId ? `note-${noteId}` : "empty-state";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="app-shell">
      <div className="app-window">
        <AppHeader theme={theme} onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))} />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <ActivityBar />

          <AnimatePresence initial={false}>
            {!isFocusMode ? (
              <motion.div
                key="sidebars"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "39.625rem", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex shrink-0 overflow-hidden"
              >
                <div className="desktop-folder-column">
                  <FoldersPanel />
                </div>
                <div className="desktop-notes-column">
                  <NotesListPanel />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <main className="desktop-main-panel flex-1 relative flex flex-col min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={animationKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex-1 h-full min-h-0 flex flex-col"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
