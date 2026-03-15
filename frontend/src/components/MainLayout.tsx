import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ActivityBar from "./SideBar";
import NotesListPanel from "./NotesListPanel";
import FoldersPanel from "./folderPanel";
import AppHeader from "./AppHeader";

const MainLayout = () => {
  const location = useLocation();
  const isFocusMode = new URLSearchParams(location.search).get("focus") === "1";
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="app-shell">
      <div className="app-window">
        <AppHeader theme={theme} onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))} />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <ActivityBar />

          {!isFocusMode ? (
            <>
              <div className="desktop-folder-column">
                <FoldersPanel />
              </div>
              <div className="desktop-notes-column">
                <NotesListPanel />
              </div>
            </>
          ) : null}

          <main className="desktop-main-panel flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
