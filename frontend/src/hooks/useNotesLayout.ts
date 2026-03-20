// import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useMediaQuery } from "./useMediaQuery";

export const useNotesLayout = () => {
    const location = useLocation();
  const { noteId, folderId } = useParams();
  const focusParam = new URLSearchParams(location.search).get("focus");
  const isEditorFocusMode = Boolean(noteId) && (focusParam === "1" || focusParam === "2");
  const isFoldersHidden = focusParam === "1" || focusParam === "2";
  const isNotesHidden = focusParam === "2";
  const isMobile = useMediaQuery("(max-width: 960px)");
  const isSearchRoute = location.pathname.startsWith("/search");
  const isProfileRoute = location.pathname.startsWith("/profile");
  const showGlobalHeader = !(isEditorFocusMode || (isMobile && Boolean(noteId)));
  
  const animationKey = noteId ? `note-${noteId}` : "empty-state";

  
  const showFoldersPanel = isMobile
  ? location.pathname === "/folders" && !folderId && !noteId
  : !isFoldersHidden;
  const showNotesPanel = isMobile
  ? !noteId && !showFoldersPanel && !isSearchRoute && !isProfileRoute
  : !isNotesHidden;
  const showMainPanel = isMobile ? Boolean(noteId) || isSearchRoute || isProfileRoute : true;

  return {
    showGlobalHeader,
    showFoldersPanel,
    showNotesPanel,
    showMainPanel,
    isMobile,
    animationKey
  }
}