import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "ai" | "error";
  isRead: boolean;
  createdAt: string; // ISO timestamp
  action?: { label: string; href: string }; // optional CTA
};

export const timeAgo = (isoString: string): string => {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(isoString).toLocaleDateString();
};

// Static onboarding notifications. When a new one is added here,
// it will automatically appear for users who haven't seen it yet.
// IDs must be unique and stable — never change an existing ID.
const STATIC_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-study-tools-v1",
    title: "AI Study Tools are LIVE 🧠",
    message: "AI quizzes and flashcards are now available in the editor.",
    type: "ai",
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "notif-agentic-web-v1",
    title: "Iris is now Agentic 🌐",
    message: "Iris can now autonomously search the web, crawl links, and analyze PDFs or images. Plus, logic visualization with Mermaid diagrams is now supported natively in chat.",
    type: "ai",
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-welcome-v1",
    title: "Welcome to Notesify, {{name}}!",
    message: "Welcome to your new workspace! Experience a completely reimagined note-taking workflow designed for speed, clarity, and beautiful aesthetics.",
    type: "info",
    isRead: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-iris-global-v1",
    title: "Iris AI is Now Global ✨",
    message: "Meet the new Iris AI chat — a dedicated space to ask anything, explore ideas, and learn faster. Your full conversation history is saved across sessions.",
    type: "ai",
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    action: { label: "Open Iris AI", href: "/chat" },
  },
];

type NotificationStore = {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, "id" | "isRead" | "createdAt">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  reset: () => void;
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: STATIC_NOTIFICATIONS,

      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            ...notification,
            id: crypto.randomUUID(),
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          ...state.notifications,
        ]
      })),

      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        )
      })),

      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
      })),

      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      })),

      clearAll: () => set({ notifications: [] }),
      reset: () => set({ notifications: STATIC_NOTIFICATIONS }),
    }),
    {
      name: 'notesify-notifications', // localStorage key
      // Merge strategy: on load, bring in any NEW static notifications
      // (ones added in code that the user hasn't seen) while preserving
      // the saved isRead/dismissed state of existing notifications.
      merge: (persistedState, currentState) => {
        const persisted = persistedState as NotificationStore;
        const persistedIds = new Set(persisted.notifications.map((n) => n.id));

        // Find any static notifications that are brand new (not in localStorage yet)
        const newStaticNotifs = STATIC_NOTIFICATIONS.filter(
          (n) => !persistedIds.has(n.id)
        );

        return {
          ...currentState,
          notifications: [
            ...newStaticNotifs,         // prepend unseen static notifications
            ...persisted.notifications,  // keep existing with their saved isRead state
          ],
        };
      },
    }
  )
);
