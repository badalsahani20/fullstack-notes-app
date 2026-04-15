import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Bot, FileText, Plus, Sparkles, Star, X } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import FoldersPanel from "./folderPanel";

type Props = {
  open: boolean;
  onClose: () => void;
};

const ease = [0.22, 1, 0.36, 1] as const;

type NavRowProps = {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
};

const NavRow = ({ icon: Icon, label, active, onClick }: NavRowProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`mobile-drawer-nav-row ${active ? "mobile-drawer-nav-row-active" : ""}`}
  >
    <Icon size={17} className="mobile-drawer-nav-icon" />
    <span className="mobile-drawer-nav-label">{label}</span>
  </button>
);

const MobileDrawer = ({ open, onClose }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { folderId, noteId } = useParams();
  const p = location.pathname;

  // Auto-close when user navigates by tapping a link inside the drawer
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const go = (path: string) => navigate(path);

  const isAllNotes  = !p.startsWith("/favorites") && !p.startsWith("/archive") && !p.startsWith("/trash") && !p.startsWith("/chat") && !p.startsWith("/search") && !p.startsWith("/profile") && !p.startsWith("/folders");
  const isFavorites = p.startsWith("/favorites");
  const isAiChat    = p.startsWith("/chat");

  const handleCreateNote = () =>
    navigate(folderId ? `/folders/${folderId}/note/new` : `/note/new`);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mob-drawer-backdrop"
            className="mobile-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            key="mob-drawer-panel"
            className="mobile-drawer-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.32, ease }}
          >
            {/* Header */}
            <div className="mobile-drawer-header">
              <div className="mobile-drawer-brand">
                <div className="relative">
                  <div className="absolute inset-0 rounded-lg bg-white/5 blur-md" />
                  <img
                    src="/notesify-favicon.png"
                    alt="Notesify"
                    width={28}
                    height={28}
                    className="relative"
                  />
                </div>
                <span className="mobile-drawer-brand-name">Notesify</span>
              </div>
              <button
                type="button"
                className="mobile-drawer-close"
                onClick={onClose}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="mobile-drawer-content custom-scrollbar">

              {/* ── Top nav links ── */}
              <div className="mobile-drawer-nav-section">
                <NavRow
                  icon={FileText}
                  label="All Notes"
                  active={isAllNotes}
                  onClick={() => go(noteId ? `/note/${noteId}` : "/")}
                />
                <NavRow
                  icon={Star}
                  label="Favorites"
                  active={isFavorites}
                  onClick={() => go(noteId ? `/favorites/note/${noteId}` : "/favorites")}
                />
                {/* Iris AI — prominent gradient chip */}
                <button
                  type="button"
                  onClick={() => go("/chat")}
                  className={`mobile-drawer-ai-btn ${isAiChat ? "mobile-drawer-ai-btn-active" : ""}`}
                >
                  <div className="mobile-drawer-ai-orb">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <p className="mobile-drawer-ai-label">Iris AI</p>
                    <p className="mobile-drawer-ai-sub">Ask anything</p>
                  </div>
                  <Bot size={15} className="mobile-drawer-ai-icon-end" />
                </button>
              </div>

              <div className="mobile-drawer-divider" />

              {/* ── Notebooks / Archive / Trash (from FoldersPanel) ── */}
              <div className="mobile-drawer-content .desktop-pane">
                <FoldersPanel />
              </div>
            </div>

            {/* Footer */}
            <div className="mobile-drawer-footer">
              <button
                type="button"
                className="mobile-drawer-create-btn"
                onClick={handleCreateNote}
              >
                <Plus size={17} />
                <span>New Note</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
