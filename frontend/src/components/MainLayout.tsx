import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import FoldersPanel from "./folderPanel";
import AppHeader from "./AppHeader";
import MobileBottomNav from "./MobileBottomNav";
import MobileCreateButton from "./MobileCreateButton";
import AppLayout from "./AppLayout";
import { useNotesLayout } from "@/hooks/useNotesLayout";
import ActivityBar from "./SideBar";
import { useFolderStore } from "@/store/useFolderStore";

type Pops = {
  middlePanel: React.ReactNode;
}
const MainLayout = ({ middlePanel }: Pops) => {
  const bootstrapStartedRef = useRef(false);
  const {
    showGlobalHeader,
    showFoldersPanel,
    showNotesPanel,
    showMainPanel,
    isMobile,
    animationKey
  } = useNotesLayout();
  const { fetchFolders } = useFolderStore();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (bootstrapStartedRef.current) return;
    bootstrapStartedRef.current = true;
    void Promise.all([
      fetchFolders()
    ]);
  }, [fetchFolders]);

  return (
    <AppLayout
      showGlobalHeader={showGlobalHeader}
      showFoldersPanel={showFoldersPanel}
      showNotesPanel={showNotesPanel}
      showMainPanel={showMainPanel}
      isMobile={isMobile}
      animationKey={animationKey}
      header={
        <AppHeader theme={theme} onToggleTheme={() => setTheme((c) => (c === "dark" ? "light" : "dark"))} />
      }
      activityBar={
        <ActivityBar />
      }
      leftPanel={
        <FoldersPanel />
      }

      middlePanel={middlePanel}
      main={
        <Outlet />
      }
      mobileBottomNav={
        <MobileBottomNav />
      }
      floatingButton={
        <MobileCreateButton />
      }
    />
  );
};

export default MainLayout;
