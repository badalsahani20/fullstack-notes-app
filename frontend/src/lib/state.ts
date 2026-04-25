import { useAuthStore } from "../store/useAuthStore";
import { useNoteStore } from "../store/useNoteStore";
import { useFolderStore } from "../store/useFolderStore";
import { useGlobalChatStore } from "../store/useGlobalChatStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { queryClient } from "./queryClient";

 // Completely wipes all local application state when user logs out or session expires.

export const clearAllLocalState = () => {
  // 1. Clear Zustand stores
  useAuthStore.getState().clearAuth();
  useNoteStore.getState().reset();
  useFolderStore.getState().reset();
  useGlobalChatStore.getState().reset();
  useNotificationStore.getState().reset();

  // 2. Clear React Query cache
  queryClient.clear();
};
