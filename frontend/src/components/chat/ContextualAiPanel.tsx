import { useMemo, useRef } from "react";
import { FileText, Type, X, RefreshCcw, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { GlobalChatMessages } from "@/components/chat/GlobalChatMessages";
import { GlobalChatCompose } from "@/components/chat/GlobalChatCompose";
import { ChatModeSelector } from "@/components/chat/ChatModeSelector";
import type { useAiChat } from "@/hooks/ai/useAiChat";
import type { Message } from "../ai/types";

type ContextualAiPanelProps = {
  aiChat: ReturnType<typeof useAiChat>;
  noteTitle?: string;
  /** True when the note hasn't been saved yet (noteId === "new") */
  isNewNote?: boolean;
  onClose: () => void;
  mobileMode?: boolean;
};

const ContextualAiPanel = ({
  aiChat,
  noteTitle,
  isNewNote = false,
  onClose,
  mobileMode = false,
}: ContextualAiPanelProps) => {
  const {
    hasHistory,
    historyCount,
    loadHistory,
    messages,
    chatInput,
    setChatInput,
    attachedImage,
    setAttachedImage,
    isSendingChat,
    sendChatMessage,
    stopRequest,
    startNewChat,
    selectionRange,
    streamingMessageId,
    streamedMessageText,
    isStreaming,
    useReasoning,
    setUseReasoning,
    useWebSearch,
    setUseWebSearch,
    chatMode,
    setChatMode,
  } = aiChat;

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const prompts = useMemo(() => ({ students: [], devs: [] }), []);

  const contextSlot = (
    <div className="note-ai-context-bar">
      <div className="note-ai-context-left">
        {isNewNote ? (
          <span className="note-ai-context-chip" style={{ color: "var(--amber-text, #d97706)", borderColor: "color-mix(in srgb, #d97706 25%, transparent)" }}>
            <Pencil size={12} />
            No note yet · General chat
          </span>
        ) : selectionRange ? (
          <span className="note-ai-context-chip">
            <Type size={12} />
            Selection
          </span>
        ) : (
          <span className="note-ai-context-chip">
            <FileText size={12} />
            Note context
          </span>
        )}
        {!isNewNote && noteTitle ? <span className="note-ai-context-note">{noteTitle}</span> : null}
      </div>
    </div>
  );

  return (
    <motion.aside
      initial={mobileMode ? { x: "100%" } : { opacity: 0 }}
      animate={mobileMode ? { x: 0 } : { opacity: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`assistant-rail relative overflow-hidden ${mobileMode ? "assistant-rail-mobile" : "flex"}`}
    >
      <div className="relative z-10 flex items-center justify-between px-4 py-2 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <ChatModeSelector chatMode={chatMode} setChatMode={setChatMode} />
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="assistant-header-action"
            onClick={() => void startNewChat()}
            title="Start fresh chat"
          >
            <RefreshCcw size={14} />
            <span>Reset</span>
          </button>
          <button type="button" className="assistant-close-button" onClick={onClose} aria-label="Close AI panel">
            <X size={16} />
          </button>
        </div>
      </div>

      {hasHistory ? (
        <div className="px-4 pt-3">
          <button
            type="button"
            className="ai-history-toggle"
            onClick={() => {
              loadHistory();
              // Let React re-render the messages before scrolling
              setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: "instant" });
              }, 0);
            }}
            aria-label={`Load ${historyCount} previous messages`}
          >
            Older chat ({historyCount} messages)
          </button>
        </div>
      ) : null}

      <GlobalChatMessages
        messages={messages as Message[]}
        messagesLoading={false}
        streamingMessageId={streamingMessageId}
        streamedMessageText={streamedMessageText}
        isStreaming={isStreaming}
        isSending={isSendingChat}
        sendMessage={(text) => void sendChatMessage(text)}
        prompts={prompts}
        bottomRef={bottomRef}
        fullWidthAssistant
        useReasoning={useReasoning}
      />

      <GlobalChatCompose
        input={chatInput}
        setInput={setChatInput}
        attachedImage={attachedImage}
        setAttachedImage={setAttachedImage}
        isSending={isSendingChat}
        imageDisabled={false}
        handleSend={() => void sendChatMessage()}
        textareaRef={textareaRef}
        fileRef={fileRef}
        topSlot={contextSlot}
        placeholder="Ask about this note or anything..."
        onStop={stopRequest}
        useReasoning={useReasoning}
        setUseReasoning={setUseReasoning}
        useWebSearch={useWebSearch}
        setUseWebSearch={setUseWebSearch}
      />
    </motion.aside>
  );
};

export default ContextualAiPanel;
