import { Check, CheckCheck, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Message, AssistResult, SelectionRange } from "@/components/ai/types";

type AiMessageProps = {
  message: Message;
  /** The text to actually display — either the growing streamed slice or the full settled text */
  displayText: string;
  /** True while this specific message is mid-animation (shows the blinking cursor) */
  isStreaming: boolean;
  /** Whether to show the Copy / Replace action buttons below this message */
  showActions: boolean;
  result: AssistResult | null;
  selectionRange: SelectionRange;
  copied: boolean;
  onCopy: () => void;
  onApply: () => void;
};

/**
 * A single message bubble in the AI chat list.
 *
 * - Assistant messages are rendered as Markdown (supports bold, code blocks, lists etc.)
 * - User messages are plain text
 * - While streaming, a blinking cursor is shown at the end
 * - After streaming, Copy / Replace action buttons appear on the last AI message
 */
const AiMessage = ({
  message,
  displayText,
  isStreaming,
  showActions,
  selectionRange,
  copied,
  onCopy,
  onApply,
}: AiMessageProps) => {
  return (
    <div className={`assistant-message assistant-message-${message.role} w-full`}>
      <div className="assistant-message-meta">
        <span className="assistant-message-role">{message.role === "assistant" ? "AI" : "You"}</span>
      </div>
      <div className="max-w-full overflow-hidden ">
        {message.role === "assistant" ? (
          <div className="prose prose-sm dark:prose-invert max-w-full overflow-hidden prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-pre:max-w-full prose-pre:overflow-x-auto break-words">
            <ReactMarkdown>{String(displayText || "")}</ReactMarkdown>
          </div>
        ) : (
          // User's own messages — plain text, no markdown needed
          message.text
        )}

        {/* Blinking cursor shown while this message is actively streaming */}
        {isStreaming && <span className="assistant-cursor" />}
      </div>

      {/* Copy / Replace buttons — only appear on the last settled AI message */}
      {showActions && (
        <div className="assistant-message-actions">
          <button type="button" className="assistant-inline-action" onClick={onCopy}>
            {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            className="assistant-inline-action"
            onClick={onApply}
            disabled={!selectionRange}
          >
            <Check size={13} />
            Replace
          </button>
        </div>
      )}
    </div>
  );
};

export default AiMessage;
