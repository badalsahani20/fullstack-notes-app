import { useMemo, useRef } from "react";
import { FileText, Type, X, RefreshCcw } from "lucide-react";
import { GlobalChatMessages } from "@/components/chat/GlobalChatMessages";
import { GlobalChatCompose } from "@/components/chat/GlobalChatCompose";
import type { useAiChat } from "@/hooks/useAiChat";
import type { Message } from "../ai/types";

type ContextualAiPanelProps = {
  aiChat: ReturnType<typeof useAiChat>;
  noteTitle?: string;
  onClose: () => void;
  mobileMode?: boolean;
};

const ContextualAiPanel = ({
  aiChat,
  noteTitle,
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
  } = aiChat;

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const prompts = useMemo(() => ({ students: [], devs: [] }), []);

  const contextSlot = (
    <div className="note-ai-context-bar">
      <div className="note-ai-context-left">
        {selectionRange ? (
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
        {noteTitle ? <span className="note-ai-context-note">{noteTitle}</span> : null}
      </div>
    </div>
  );

  return (
    <aside className={`assistant-rail ${mobileMode ? "assistant-rail-mobile" : "flex"}`}>
      <div className="gc-header note-ai-header">
        <div className="gc-header-avatar ai-rail-button ai-rail-button-active cursor-default">
          <div className="iris-orb" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="gc-header-name">Iris</p>
          <p className="gc-header-sub">Note-aware assistant</p>
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
        placeholder="Ask about this note, get ideas, or request edits..."
        onStop={stopRequest}
      />
    </aside>
  );
};

export default ContextualAiPanel;
