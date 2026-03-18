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
  const focusParam = new URLSearchParams(location.search).get("focus");
  const isFoldersHidden = focusParam === "1" || focusParam === "2";
  const isNotesHidden = focusParam === "2";
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
            {!isFoldersHidden && (
              <motion.div
                key="folders"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "15.625rem", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="shrink-0 overflow-hidden h-full"
              >
                <div className="desktop-folder-column w-full h-full">
                  <FoldersPanel />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {!isNotesHidden && (
              <motion.div
                key="notes"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "24rem", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="shrink-0 overflow-hidden h-full"
              >
                <div className="desktop-notes-column w-full h-full">
                  <NotesListPanel />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
