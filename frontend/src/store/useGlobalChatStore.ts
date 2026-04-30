import { create } from "zustand";
import api from "@/lib/api";
import { parseIrisResponse } from "../utils/parseIrisResponse";



export type IrisSegment = 
  | {id?: string; kind: "text"; content: string}
  | {id?: string; kind: "viz"; type: "mermaid" | "chart" | "math"; title: string; data: string };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  segments?: IrisSegment[];
  skipAnimation?: boolean;
  thought?: string;
  isThinking?: boolean;
  thinkingTime?: number;
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
  reset: () => void;
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
      const mapped: ChatMessage[] = data.data.messages.map((m: { role: string; content: string; segments?: IrisSegment[] }) => ({
        id: crypto.randomUUID(),
        role: m.role as "user" | "assistant",
        text: m.content,
        segments: m.segments,
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

    // 1. Optimistically add user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: image ? `[Image attached] ${text}` : text,
    };

    // 2. Add empty assistant message for streaming
    const aiMsgId = crypto.randomUUID();
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: "assistant",
      text: "", // Will be filled chunk by chunk
      skipAnimation: true, // 🚀 Stops the jitter
      isThinking: true,
      thinkingTime: 0,
    };

    set({ 
      messages: [...messages, userMsg, aiMsg], 
      isSending: true, 
      attachedImage: null 
    });

    try {
      const { accessToken } = (await import("./useAuthStore")).useAuthStore.getState();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: text,
          sessionId: activeSessionId,
          imageBase64: image || undefined,
          stream: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to connect to AI");
      if (!response.body) throw new Error("No response body");

      // 🆔 Catch early sessionId from header
      const newSessionId = response.headers.get("X-Session-Id");
      if (newSessionId) set({ activeSessionId: newSessionId });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let fullThought = "";
      let lastUpdateTime = 0;
      const THROTTLE_MS = 60;
      const startTime = Date.now();
      let thinkingEndTime = 0;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6));
              const delta = data.choices?.[0]?.delta;
              
              const content = delta?.content || "";
              const reasoning = delta?.reasoning || "";
              
              if (content && fullText.length === 0) {
                // First content token arrived — thinking is done
                thinkingEndTime = Date.now();
              }
              
              fullText += content;
              fullThought += reasoning;

              const now = Date.now();
              if (now - lastUpdateTime > THROTTLE_MS) {
                const currentThinkingTime = thinkingEndTime 
                  ? Math.floor((thinkingEndTime - startTime) / 1000) 
                  : Math.floor((now - startTime) / 1000);

                set((state) => ({
                  messages: state.messages.map((m) =>
                    m.id === aiMsgId ? { 
                      ...m, 
                      text: fullText,
                      thought: fullThought,
                      isThinking: fullText.length === 0,
                      thinkingTime: currentThinkingTime
                    } : m
                  ),
                }));
                lastUpdateTime = now;
              }
            } catch (e) {}
          }
        }
      }

      // 🎨 FINAL POLISH: Parse visualizations and clean up state
      const segments = parseIrisResponse(fullText);
      const finalThinkingTime = thinkingEndTime 
        ? Math.floor((thinkingEndTime - startTime) / 1000) 
        : (fullThought ? Math.floor((Date.now() - startTime) / 1000) : 0);

      set((state) => ({
        isSending: false,
        messages: state.messages.map((m) =>
          m.id === aiMsgId ? { 
            ...m, 
            text: fullText,
            thought: fullThought,
            isThinking: false,
            thinkingTime: finalThinkingTime,
            segments,
            skipAnimation: true 
          } : m
        ),
      }));

      // Refresh sidebar sessions
      get().fetchSessions();

    } catch (err: any) {
      set((state) => ({
        isSending: false,
        messages: state.messages.map((m) =>
          m.id === aiMsgId ? { ...m, text: "⚠️ Something went wrong. Please try again." } : m
        ),
      }));
    }
  },

  setAttachedImage: (img) => set({ attachedImage: img }),
  reset: () => set({
    sessions: [],
    sessionsLoading: false,
    activeSessionId: null,
    messages: [],
    messagesLoading: false,
    isSending: false,
    attachedImage: null,
    imageDisabled: false,
  }),
}));
