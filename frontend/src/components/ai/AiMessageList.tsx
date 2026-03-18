import { useEffect, useRef } from "react";
import AiMessage from "@/components/ai/AiMessage";
import type { Message, AssistResult, SelectionRange } from "@/components/ai/types";

type AiMessageListProps = {
  messages: Message[];
  streamingMessageId: string | null;
  streamedMessageText: string;
  isStreaming: boolean;
  result: AssistResult | null;
  selectionRange: SelectionRange;
  copied: boolean;
  onCopy: () => void;
  onApply: () => void;
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
  messages,
  streamingMessageId,
  streamedMessageText,
  isStreaming,
  result,
  selectionRange,
  copied,
  onCopy,
  onApply,
}: AiMessageListProps) => {
  // The ref lives here now — only AiMessageList needs to touch the DOM node
  const listRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom whenever messages grow or streamed text updates
  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, streamedMessageText]);

  return (
    <div ref={listRef} className="custom-scrollbar assistant-message-list">
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
    </div>
  );
};

export default AiMessageList;
