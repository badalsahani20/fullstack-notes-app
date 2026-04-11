import { X, RefreshCcw } from "lucide-react";
import { useAiChat } from "@/hooks/useAiChat";
import AiGuideDialog from "@/components/ai/AiGuideDialog";
import AiMessageList from "@/components/ai/AiMessageList";
import AiCompose from "@/components/ai/AiCompose";

type AiAuditPanelProps = {
  aiChat: ReturnType<typeof useAiChat>;
  onClose: () => void;
  mobileMode?: boolean;
};

/**
 * AI Assistant panel — the glue layer.
 *
 * Now receives state from parent so it can be shared with the inline editor menu.
 */
const AiAuditPanel = ({ aiChat, onClose, mobileMode = false }: AiAuditPanelProps) => {
  const {
    hasHistory,
    historyCount,
    loadHistory,
    messages,
    streamingMessageId,
    streamedMessageText,
    isStreaming,
    result,
    selectionRange,
    copied,
    chatInput,
    setChatInput,
    attachedImage,
    setAttachedImage,
    loadingAction,
    isSendingChat,
    sendChatMessage,
    stopRequest,
    runAction,
    copySuggestion,
    applySuggestionToSelection,
    startNewChat,
  } = aiChat;

  return (
    <aside className={`assistant-rail ${mobileMode ? "assistant-rail-mobile" : "hidden xl:flex"}`}>
      <AiGuideDialog />

      {mobileMode ? <div className="assistant-mobile-handle" aria-hidden="true" /> : null}

      <div className="assistant-rail-header assistant-rail-header-row">
        <div className="assistant-panel-heading">
          <h3 className="assistant-panel-title">AI Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <button 
            type="button" 
            className="assistant-header-action" 
            onClick={startNewChat}
            title="Start fresh chat (clears history)"
          >
            <RefreshCcw size={14} />
            <span>Reset</span>
          </button>
          <button type="button" className="assistant-close-button" onClick={onClose} aria-label="Close AI panel">
            <X size={16} />
          </button>
        </div>
      </div>

      <AiMessageList
        hasHistory={hasHistory}
        historyCount={historyCount}
        onLoadHistory={loadHistory}
        messages={messages}
        streamingMessageId={streamingMessageId}
        streamedMessageText={streamedMessageText}
        isStreaming={isStreaming}
        result={result}
        selectionRange={selectionRange}
        copied={copied}
        onCopy={copySuggestion}
        onApply={applySuggestionToSelection}
      />

      <AiCompose
        chatInput={chatInput}
        selectionRange={selectionRange}
        loadingAction={loadingAction}
        isSending={isSendingChat}
        mobileMode={mobileMode}
        attachedImage={attachedImage}
        setAttachedImage={setAttachedImage}
        onInputChange={setChatInput}
        onSend={() => void sendChatMessage()}
        onStop={stopRequest}
        onAction={(action) => void runAction(action)}
      />
    </aside>
  );
};

export default AiAuditPanel;
