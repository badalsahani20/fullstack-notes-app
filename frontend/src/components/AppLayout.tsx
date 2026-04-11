import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import type { PanelImperativeHandle } from "react-resizable-panels";

const panelEase = [0.22, 1, 0.36, 1] as const;

type Props = {
  showGlobalHeader: boolean;
  showFoldersPanel: boolean;
  showNotesPanel: boolean;
  showMainPanel: boolean;
  isMobile: boolean;

  header: React.ReactNode;
  activityBar: React.ReactNode;
  leftPanel: React.ReactNode;
  middlePanel: React.ReactNode;
  main: React.ReactNode;

  mobileBottomNav: React.ReactNode;
  floatingButton: React.ReactNode;

  animationKey: string;
}

const AppLayout = ({
  showGlobalHeader, activityBar, showFoldersPanel, showNotesPanel,
  showMainPanel, isMobile, header, leftPanel, middlePanel, main,
  mobileBottomNav, floatingButton, animationKey
}: Props) => {
  const foldersPanelRef = useRef<PanelImperativeHandle | null>(null);
  const notesPanelRef = useRef<PanelImperativeHandle | null>(null);

  // Folders panel: toggle open/close based on store state
  useEffect(() => {
    if (isMobile) return;
    const panel = foldersPanelRef.current;
    if (!panel) return;
    if (showFoldersPanel) {
      panel.expand();
    } else {
      panel.collapse();
    }
  }, [showFoldersPanel, isMobile]);

  // Notes panel: collapse in focus=2 mode, expand otherwise
  useEffect(() => {
    if (isMobile) return;
    const panel = notesPanelRef.current;
    if (!panel) return;
    if (showNotesPanel) {
      panel.expand();
    } else {
      panel.collapse();
    }
  }, [showNotesPanel, isMobile]);

  // Guard: if URL says panel should be visible but user dragged it to 0,
  // re-expand on next render (catches navigation after manual collapse)
  useEffect(() => {
    if (isMobile) return;
    const np = notesPanelRef.current;
    if (np && showNotesPanel && np.isCollapsed()) np.expand();
    const fp = foldersPanelRef.current;
    if (fp && showFoldersPanel && fp.isCollapsed()) fp.expand();
  }); // no deps — intentional

  return (
    <div className="app-shell">
      <div className={`app-window ${isMobile ? "mobile-app-window" : ""}`}>
        <AnimatePresence initial={false} mode="wait">
          {showGlobalHeader ? (
            <motion.div
              key="global-header"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.24, ease: panelEase }}
            >
              {header}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          {!isMobile ? activityBar : null}

          {isMobile ? (
            /* ── MOBILE ── */
            <>
              <AnimatePresence initial={false}>
                {showFoldersPanel && (
                  <motion.div
                    key="folders"
                    initial={{ width: 0, opacity: 0, x: -24 }}
                    animate={{ width: "100%", opacity: 1, x: 0 }}
                    exit={{ width: 0, opacity: 0, x: -24 }}
                    transition={{ duration: 0.34, ease: panelEase }}
                    className="h-full shrink-0 overflow-hidden"
                  >
                    <div className="desktop-folder-column w-full h-full">
                      {leftPanel}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {showNotesPanel && (
                  <motion.div
                    key="notes"
                    initial={{ width: 0, opacity: 0, x: 24 }}
                    animate={{ width: "100%", opacity: 1, x: 0 }}
                    exit={{ width: 0, opacity: 0, x: 24 }}
                    transition={{ duration: 0.36, ease: panelEase }}
                    className="h-full shrink-0 overflow-hidden"
                  >
                    <div className="desktop-notes-column w-full h-full">
                      {middlePanel}
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
                    transition={{ duration: 0.22, ease: panelEase }}
                    className="flex-1 h-full min-h-0 flex flex-col"
                  >
                    {main}
                  </motion.div>
                </main>
              ) : null}
            </>
          ) : (
            /* ── DESKTOP — resizable panels ── */
            <ResizablePanelGroup
              orientation="horizontal"
              className="flex-1 overflow-hidden"
            >
              {/* Folder panel: hidden by default, toggled from activity bar */}
              <ResizablePanel
                id="folders"
                defaultSize="0%"
                maxSize="30%"
                minSize="15%"
                collapsible={true}
                collapsedSize="0%"
                panelRef={foldersPanelRef}
              >
                <div className="desktop-folder-column w-full h-full overflow-hidden">
                  {leftPanel}
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Notes panel: always visible by default */}
              <ResizablePanel
                id="notes"
                defaultSize="30%"
                maxSize="50%"
                minSize="15%"
                collapsible={true}
                collapsedSize="0%"
                panelRef={notesPanelRef}
              >
                <div className="desktop-notes-column w-full h-full overflow-hidden">
                  {middlePanel}
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Editor: fills remaining space */}
              <ResizablePanel id="main" minSize="20%">
                <main className="desktop-main-panel w-full h-full relative flex flex-col min-w-0">
                  {main}
                </main>
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>

        {isMobile ? mobileBottomNav : null}
        {isMobile ? floatingButton : null}
      </div>
    </div>
  );
};

export default AppLayout;
