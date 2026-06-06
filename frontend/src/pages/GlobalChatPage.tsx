import { useEffect, useRef, useState } from "react";
import { useGlobalChatStore } from "@/store/useGlobalChatStore";
import { useTypewriter } from "@/hooks/useTypewriter";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Message } from "@/components/ai/types";
import { STUDENT_PROMPTS, DEV_PROMPTS } from "@/lib/constants";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { GlobalChatSidebar } from "@/components/chat/GlobalChatSidebar";
import { GlobalChatMessages } from "@/components/chat/GlobalChatMessages";
import { GlobalChatCompose } from "@/components/chat/GlobalChatCompose";

const GlobalChatPage = () => {
  const {
    sessions, sessionsLoading,
    activeSessionId, messages, messagesLoading,
    isSending, attachedImage, imageDisabled,
    fetchSessions, loadSession, startNewChat, sendMessage, setAttachedImage,
    useReasoning, setUseReasoning,
    useWebSearch, setUseWebSearch,
  } = useGlobalChatStore();

  const [input, setInput] = useState("");
  const [prompts, setPrompts] = useState({ students: STUDENT_PROMPTS, devs: DEV_PROMPTS });

  const isMobile = useMediaQuery("(max-width: 960px)");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Shared typewriter hook — no skip IDs needed for global chat
  const { streamingMessageId, streamedMessageText, isStreaming } = useTypewriter(
    messages as Message[],
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchSessions();
    // Fetch dynamic prompts
    import("@/lib/api").then(({ default: api }) => {
      api.get("/public/prompts")
        .then(res => {
          if (res.data.success) {
            setPrompts({
              students: res.data.data.studentPrompts,
              devs: res.data.data.devPrompts
            });
          }
        })
        .catch(() => { }); // Keep fallbacks on error
    });
  }, [fetchSessions]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = () => {
    const text = input.trim();
    if (!text && !attachedImage) return;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    sendMessage(text, attachedImage);
  };

  return (
    <div className="gc-shell">
      <GlobalChatSidebar
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sessions={sessions}
        sessionsLoading={sessionsLoading}
        activeSessionId={activeSessionId}
        loadSession={loadSession}
        startNewChat={startNewChat}
      />

      {/* ── Main chat area ── */}
      <div className="gc-main">
        {/* Header */}
        <div className="gc-header">
          {/* Sidebar toggle */}
          <button
            className="gc-icon-btn"
            onClick={() => setSidebarOpen((o) => !o)}
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>

          <div className="gc-header-avatar ai-rail-button ai-rail-button-active cursor-default">
            <div className="iris-orb" />
          </div>
          <div>
            <p className="gc-header-name">Iris</p>
            <p className="gc-header-sub">Your AI Study Partner</p>
          </div>
        </div>

        <GlobalChatMessages
          messages={messages as Message[]}
          messagesLoading={messagesLoading}
          streamingMessageId={streamingMessageId}
          streamedMessageText={streamedMessageText}
          isStreaming={isStreaming}
          isSending={isSending}
          sendMessage={(text) => sendMessage(text)}
          prompts={prompts}
          bottomRef={bottomRef}
          fullWidthAssistant
          useReasoning={useReasoning}
        />

        <GlobalChatCompose
          input={input}
          setInput={setInput}
          attachedImage={attachedImage}
          setAttachedImage={setAttachedImage}
          isSending={isSending}
          imageDisabled={imageDisabled}
          handleSend={handleSend}
          textareaRef={textareaRef}
          fileRef={fileRef}
          useReasoning={useReasoning}
          setUseReasoning={setUseReasoning}
          useWebSearch={useWebSearch}
          setUseWebSearch={setUseWebSearch}
        />
      </div>
    </div>
  );
};

export default GlobalChatPage;
