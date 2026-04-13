import { create } from 'zustand';

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "ai" | "error";
  isRead: boolean;
  time: string;
};

type NotificationStore = {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, "id" | "isRead" | "time">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [
    {
      id: "1",
      title: "Welcome to Notesify, {{name}}!",
      message: "Welcome to your new workspace! Experience a completely reimagined note-taking workflow designed for speed, clarity, and beautiful aesthetics. We're glad to have you here!",
      type: "info",
      isRead: false,
      time: "Just now",
    },
    {
      id: "2",
      title: "AI Vision Now Supported",
      message: "You can now upload images and analyze them using our advanced Multimodal AI directly in your notes.",
      type: "ai",
      isRead: false,
      time: "2h ago",
    },
    {
      id: "4",
      title: "Your Data is Secured",
      message: "Your workspace is configured and reliably syncing with our secure cloud servers.",
      type: "success",
      isRead: true,
      time: "1d ago",
    },
  ],

  addNotification: (notification) => set((state) => ({
    notifications: [
      {
        ...notification,
        id: crypto.randomUUID(),
        isRead: false,
        time: "Just now", // In a real app, time parsing helper like 'date-fns' could be used
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
}));
