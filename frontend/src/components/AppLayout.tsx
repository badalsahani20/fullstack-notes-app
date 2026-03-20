import { AnimatePresence, motion } from "framer-motion";

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

const AppLayout = ({showGlobalHeader, activityBar, showFoldersPanel, showNotesPanel, showMainPanel, isMobile, header, leftPanel, middlePanel, main, mobileBottomNav, floatingButton, animationKey}: Props) => {
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
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {header}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          {!isMobile ? activityBar: null}

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
                  {leftPanel}
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
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex-1 h-full min-h-0 flex flex-col"
              >
                {main}
              </motion.div>
            </main>
          ) : null}
        </div>

        {isMobile ? mobileBottomNav : null}
        {isMobile ? floatingButton : null}
      </div>
    </div>
  )
}

export default AppLayout