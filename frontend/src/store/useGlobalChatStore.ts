import { create } from "zustand";
import api from "@/lib/api";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  skipAnimation?: boolean;
};

export type ChatSession = {
  _id: string;
  title: string;
  updatedAt: string;
};

type GlobalChatStore = {
  // Sidebar
  sessions: ChatSession[];
  sessionsLoading: boolean;

  // Active chat
  activeSessionId: string | null;
  messages: ChatMessage[];
  messagesLoading: boolean;

  // Compose
  isSending: boolean;
  attachedImage: string | null;
  imageDisabled: boolean;

  // Actions
  fetchSessions: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  startNewChat: () => void;
  sendMessage: (text: string, image?: string | null) => Promise<void>;
  setAttachedImage: (img: string | null) => void;
};

export const useGlobalChatStore = create<GlobalChatStore>((set, get) => ({
  sessions: [],
  sessionsLoading: false,
  activeSessionId: null,
  messages: [],
  messagesLoading: false,
  isSending: false,
  attachedImage: null,
  imageDisabled: false,

  fetchSessions: async () => {
    set({ sessionsLoading: true });
    try {
      const { data } = await api.get("/ai/sessions");
      set({ sessions: data.data.sessions });
    } catch {
      // silently fail — sidebar just stays empty
    } finally {
      set({ sessionsLoading: false });
    }
  },

  loadSession: async (sessionId: string) => {
    set({ messagesLoading: true, activeSessionId: sessionId, messages: [] });
    try {
      const { data } = await api.get(`/ai/chat/session/${sessionId}`);
      const mapped: ChatMessage[] = data.data.messages.map((m: { role: string; content: string }) => ({
        id: crypto.randomUUID(),
        role: m.role as "user" | "assistant",
        text: m.content,
        skipAnimation: true,
      }));
      set({ messages: mapped });
    } catch {
      set({ messages: [] });
    } finally {
      set({ messagesLoading: false });
    }
  },

  startNewChat: () => {
    set({ activeSessionId: null, messages: [], attachedImage: null });
  },

  sendMessage: async (text: string, image?: string | null) => {
    const { activeSessionId, messages } = get();

    // Optimistically add user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: image ? `[Image attached] ${text}` : text,
    };
    set({ messages: [...messages, userMsg], isSending: true, attachedImage: null });

    try {
      const { data } = await api.post("/ai/chat", {
        message: text,
        sessionId: activeSessionId,
        imageBase64: image || undefined,
        // noteContext intentionally omitted — this is global chat
      });

      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: data.data.reply,
      };

      const newSessionId = data.data.sessionId;

      set((state) => ({
        messages: [...state.messages, aiMsg],
        activeSessionId: newSessionId,
        isSending: false,
      }));

      // If this was a brand new session, refresh sidebar after a short delay
      // (title generation is async on backend — give it a moment)
      if (!activeSessionId && newSessionId) {
        setTimeout(() => get().fetchSessions(), 1500);
      } else {
        // Re-fetch to update updatedAt ordering in sidebar
        get().fetchSessions();
      }

    } catch (err: any) {
      // Check if NVIDIA rate limited image
      if (err?.response?.data?.imageRateLimited) {
        set({ imageDisabled: true, isSending: false });
        return;
      }

      // Add error message to chat
      set((state) => ({
        isSending: false,
        messages: [
          ...state.messages,
          {
            id: crypto.randomUUID(),
            role: "assistant" as const,
            text: "⚠️ Something went wrong. Please try again.",
          },
        ],
      }));
    }
  },

  setAttachedImage: (img) => set({ attachedImage: img }),
}));
