import { useMemo, useRef } from "react";
import { FileText, RefreshCcw, Type, Wand2, X, Loader2 } from "lucide-react";
import { useTypewriter } from "@/hooks/useTypewriter";
import { GlobalChatMessages } from "@/components/chat/GlobalChatMessages";
import { GlobalChatCompose } from "@/components/chat/GlobalChatCompose";
import type { useAiChat } from "@/hooks/useAiChat";
import type { Message, AiAction } from "@/components/ai/types";
import { actionMeta } from "@/components/ai/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    runAction,
    selectionRange,
    loadingAction,
  } = aiChat;

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { streamingMessageId, streamedMessageText, isStreaming } = useTypewriter(
    messages as Message[],
    new Set(["welcome"]),
  );

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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={isSendingChat || loadingAction !== null}
            className="note-ai-actions-btn disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {loadingAction ? (
              <Loader2 size={13} className="animate-spin text-[var(--accent-strong)]" />
            ) : (
              <Wand2 size={13} />
            )}
            {loadingAction ? "Thinking..." : "Actions"}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="assistant-actions-menu w-48 shadow-md z-[99999]"
        >
          {(Object.keys(actionMeta) as AiAction[]).map((action) => (
            <DropdownMenuItem
              key={action}
              onClick={() => void runAction(action)}
              className="assistant-actions-menu-item cursor-pointer text-sm py-1.5 transition-colors"
              title={actionMeta[action].prompt}
            >
              {actionMeta[action].label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
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
            onClick={loadHistory}
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
        sendMessage={() => {}}
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
