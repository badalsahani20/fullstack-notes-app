import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import FoldersPanel from "./folderPanel";
import AppHeader from "./AppHeader";
import MobileBottomNav from "./MobileBottomNav";
import MobileCreateButton from "./MobileCreateButton";
import AppLayout from "./AppLayout";
import { useNotesLayout } from "@/hooks/useNotesLayout";
import ActivityBar from "./SideBar";

type Pops = {
  middlePanel: React.ReactNode;
}
const MainLayout = ({ middlePanel }: Pops) => {
  const {
    showGlobalHeader,
    showFoldersPanel,
    showNotesPanel,
    showMainPanel,
    isMobile,
    animationKey
  } = useNotesLayout();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

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
