import { useLocation, useParams } from "react-router-dom";
import { useMediaQuery } from "./useMediaQuery";
import { usePanelStore } from "@/store/usePanelStore";

export const useNotesLayout = () => {
  const location = useLocation();
  const { noteId, folderId } = useParams();
  const focusParam = new URLSearchParams(location.search).get("focus");
  const isEditorFocusMode = Boolean(noteId) && (focusParam === "1" || focusParam === "2");
  const isNotesHidden = focusParam === "2";
  const isMobile = useMediaQuery("(max-width: 960px)");
  const isSearchRoute = location.pathname.startsWith("/search");
  const isProfileRoute = location.pathname.startsWith("/profile");
  const showGlobalHeader = !(isEditorFocusMode || (isMobile && Boolean(noteId)));

  const animationKey = noteId ? `note-${noteId}` : "empty-state";

  // Desktop: folder panel is toggled via the activity bar icon (store state).
  // It starts hidden and is never auto-opened by URL — user must click.
  // In fullscreen/focus mode it's always hidden.
  const { isFolderPanelOpen } = usePanelStore();

  const showFoldersPanel = isMobile
    ? location.pathname === "/folders" && !folderId && !noteId
    : isFolderPanelOpen && !isEditorFocusMode;

  const showNotesPanel = isMobile
    ? !noteId && !showFoldersPanel && !isSearchRoute && !isProfileRoute
    : !isNotesHidden;

  const showMainPanel = isMobile
    ? Boolean(noteId) || isSearchRoute || isProfileRoute
    : true;

  const showMobileBottomNav = isMobile && !noteId;

  return {
    showGlobalHeader,
    showFoldersPanel,
    showNotesPanel,
    showMainPanel,
    showMobileBottomNav,
    isMobile,
    animationKey,
  };
};