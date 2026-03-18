import type { Editor } from "@tiptap/react";
import { X } from "lucide-react";
import { useAiChat } from "@/hooks/useAiChat";
import AiGuideDialog from "@/components/ai/AiGuideDialog";
import AiMessageList from "@/components/ai/AiMessageList";
import AiCompose from "@/components/ai/AiCompose";

type AiAuditPanelProps = {
  noteId: string;
  noteContent: string;
  editor: Editor | null;
  onClose: () => void;
};

/**
 * AI Assistant panel — the glue layer.
 *
 * This component owns nothing except layout and the onClose button.
 * All state and logic lives in useAiChat.
 * All UI sections live in AiGuideDialog / AiMessageList / AiCompose.
 */
const AiAuditPanel = ({ noteId, noteContent, editor, onClose }: AiAuditPanelProps) => {
  const {
    messages,
    streamingMessageId,
    streamedMessageText,
    isStreaming,
    result,
    selectionRange,
    copied,
    chatInput,
    setChatInput,
    loadingAction,
    isSendingChat,
    sendChatMessage,
    stopRequest,
    runAction,
    copySuggestion,
    applySuggestionToSelection,
  } = useAiChat(noteId, noteContent, editor);

  return (
    <aside className="assistant-rail hidden xl:flex">
      <AiGuideDialog />

      <div className="assistant-rail-header assistant-rail-header-row">
        <h3 className="assistant-panel-title">AI Assistant</h3>
        <button type="button" className="assistant-close-button" onClick={onClose} aria-label="Close AI panel">
          <X size={16} />
        </button>
      </div>

      <AiMessageList
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
        onInputChange={setChatInput}
        onSend={() => void sendChatMessage()}
        onStop={stopRequest}
        onAction={(action) => void runAction(action)}
      />
    </aside>
  );
};

export default AiAuditPanel;
