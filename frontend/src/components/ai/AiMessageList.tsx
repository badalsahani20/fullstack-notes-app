import { useEffect, useRef } from "react";
import AiMessage from "@/components/ai/AiMessage";
import type { Message, AssistResult, SelectionRange } from "@/components/ai/types";

type AiMessageListProps = {
  hasHistory: boolean;
  historyCount: number;
  onLoadHistory: () => void;
  messages: Message[];
  streamingMessageId: string | null;
  streamedMessageText: string;
  isStreaming: boolean;
  result: AssistResult | null;
  selectionRange: SelectionRange;
  copied: boolean;
  onCopy: () => void;
  onApply: () => void;
  isSending?: boolean;
};

/**
 * The scrollable message list in the AI panel.
 *
 * Owns two things the parent no longer needs to think about:
 * 1. The scroll container (via an internal ref)
 * 2. Auto-scrolling to the bottom whenever new messages arrive or
 *    the streamed text grows — so the user always sees the latest content
 */
const AiMessageList = ({
  hasHistory,
  historyCount,
  onLoadHistory,
  messages,
  streamingMessageId,
  streamedMessageText,
  isStreaming,
  result,
  selectionRange,
  copied,
  onCopy,
  onApply,
  isSending,
}: AiMessageListProps) => {
  // The ref lives here now — only AiMessageList needs to touch the DOM node
  const listRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on real message events (new message or sending state),
  // NOT on every typewriter character — avoids viewport jumping during streaming.
  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, isSending]);

  return (
    <div ref={listRef} className="custom-scrollbar assistant-message-list">
      {hasHistory && (
        <button
          type="button"
          className="ai-history-toggle"
          onClick={onLoadHistory}
          aria-label={`Load ${historyCount} previous messages`}
        >
          Older chat ({historyCount} messages)
        </button>
      )}

      {messages.map((message, index) => {
        // Is this the message currently being animated? 
        const isStreamed =
          message.id === streamingMessageId && (streamedMessageText || isStreaming);

        return (
          <AiMessage
            key={message.id}
            message={message}
            displayText={isStreamed ? streamedMessageText : message.text}
            isStreaming={Boolean(isStreamed && isStreaming)}
            showActions={
              message.role === "assistant" &&
              !isStreaming &&
              Boolean(result?.suggestion) &&
              index === messages.length - 1
            }
            result={result}
            selectionRange={selectionRange}
            copied={copied}
            onCopy={onCopy}
            onApply={onApply}
          />
        );
      })}

      {isSending && (
        <div className="assistant-message assistant-message-assistant w-full">
          <div className="assistant-message-meta mb-1">
            <span className="assistant-message-role">AI</span>
          </div>
          <div className="flex items-center gap-1.5 h-5 px-1 opacity-70">
            <span className="w-1.5 h-1.5 bg-[var(--text-strong)] rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-[var(--text-strong)] rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-[var(--text-strong)] rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AiMessageList;
