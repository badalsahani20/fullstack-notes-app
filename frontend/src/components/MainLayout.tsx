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
    showMobileBottomNav,
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

  const onToggleTheme = (event: React.MouseEvent) => {
    const isDark = theme === "dark";
    const nextTheme = isDark ? "light" : "dark";

    // Fallback if view transition is not supported
    if (!(document as any).startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = (document as any).startViewTransition(() => {
      document.documentElement.classList.add("theme-transitioning");
      setTheme(nextTheme);
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove("theme-transitioning");
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 450,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <AppLayout
      showGlobalHeader={showGlobalHeader}
      showFoldersPanel={showFoldersPanel}
      showNotesPanel={showNotesPanel}
      showMainPanel={showMainPanel}
      isMobile={isMobile}
      animationKey={animationKey}
      header={
        <AppHeader theme={theme} onToggleTheme={onToggleTheme} />
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
        showMobileBottomNav ? <MobileBottomNav /> : null
      }
      floatingButton={
        showMobileBottomNav ? <MobileCreateButton /> : null
      }
    />
  );
};

export default MainLayout;
