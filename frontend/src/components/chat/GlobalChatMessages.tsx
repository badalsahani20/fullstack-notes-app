import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { BrainCircuit, ChevronRight } from "lucide-react";
import MarkdownCodeBlock from "@/components/chat/MarkdownCodeBlock";
import { GlobalChatEmptyState } from "@/components/chat/GlobalChatEmptyState";
import type { Message } from "@/components/ai/types";
import IrisMessageBody from "./IrisMessageBody";

const markdownComponents = {
  code({ className, children, ...props }: any) {
    const rawCode = String(children ?? "").replace(/\n$/, "");
    const language = className?.replace("language-", "") || "";
    const isBlock = Boolean(language) || rawCode.includes("\n");

    if (!isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }

    return <MarkdownCodeBlock code={rawCode} language={language} />;
  },
};

// --- Thinking Widget ---
interface ThinkingWidgetProps {
  isThinking: boolean;
  thinkingTime?: number;
  thought?: string;
}

const ThinkingWidget = ({ isThinking, thinkingTime, thought }: ThinkingWidgetProps) => {
  // If we have thought text, show it in a collapsible detail block
  if (thought) {
    return (
      <details className="iris-thinking-details" open={isThinking}>
        <summary className={`iris-thinking-summary ${!isThinking ? "iris-thinking-summary-done" : ""}`}>
          <ChevronRight size={14} className="iris-chevron" />
          <span>{isThinking ? "Thinking" : `Thought for ${thinkingTime}s`}</span>
          {isThinking && (
            <span className="iris-thinking-indicator-dots">
              <span style={{ animationDelay: "0ms" }} />
              <span style={{ animationDelay: "180ms" }} />
              <span style={{ animationDelay: "360ms" }} />
            </span>
          )}
        </summary>
        <div className="iris-thinking-content">
          {thought}
        </div>
      </details>
    );
  }

  // Pure waiting state (no thoughts yet): show animated spinner
  if (isThinking) {
    return (
      <div className="iris-thinking-indicator">
        <BrainCircuit size={12} className="iris-thinking-indicator-icon" />
        <span>Thinking</span>
        <span className="iris-thinking-indicator-dots">
          <span style={{ animationDelay: "0ms" }} />
          <span style={{ animationDelay: "180ms" }} />
          <span style={{ animationDelay: "360ms" }} />
        </span>
      </div>
    );
  }

  // Done: closed time badge — no content, nothing to expand
  if (thinkingTime && thinkingTime > 0) {
    return (
      <div className="iris-thinking-indicator iris-thinking-indicator-done">
        <BrainCircuit size={12} className="iris-thinking-indicator-icon" />
        <span>Thought for {thinkingTime}s</span>
      </div>
    );
  }

  return null;
};

// --- Main Component ---

interface GlobalChatMessagesProps {
  messages: Message[];
  messagesLoading: boolean;
  streamingMessageId: string | null;
  streamedMessageText: string;
  isStreaming: boolean;
  isSending: boolean;
  sendMessage: (text: string) => void;
  prompts: { students: string[], devs: string[] };
  bottomRef: React.RefObject<HTMLDivElement | null>;
  fullWidthAssistant?: boolean;
}

export const GlobalChatMessages = ({
  messages,
  messagesLoading,
  streamingMessageId,
  streamedMessageText,
  isStreaming,
  sendMessage,
  prompts,
  bottomRef,
  fullWidthAssistant = false,
}: GlobalChatMessagesProps) => {
  return (
    <div className={`gc-messages custom-scrollbar${fullWidthAssistant ? " gc-messages-fullwidth-assistant" : ""}`}>
      {messagesLoading ? (
        <div className="gc-loading-wrap">
          <div className="gc-loading-dot" style={{ animationDelay: "0ms" }} />
          <div className="gc-loading-dot" style={{ animationDelay: "150ms" }} />
          <div className="gc-loading-dot" style={{ animationDelay: "300ms" }} />
        </div>
      ) : messages.length === 0 ? (
        <GlobalChatEmptyState onChipClick={sendMessage} prompts={prompts} />
      ) : (
        messages.map((msg) => {
          const isActiveStream = msg.id === streamingMessageId;
          const displayText = isActiveStream ? streamedMessageText : msg.text;
          const isThinking = (msg as any).isThinking ?? false;
          const thinkingTime = (msg as any).thinkingTime as number | undefined;
          const thought = (msg as any).thought as string | undefined;
          const toolCalls = (msg as any).toolCalls as Array<{ tool: string }> | undefined;

          return (
            <div key={msg.id} className={`gc-msg gc-msg-${msg.role}`}>
              {msg.role === "assistant" ? (
                <>
                  {/* ── Pure waiting state: pill only, no bubble wrapper ── */}
                  {isThinking && !displayText && !thought ? (
                    <ThinkingWidget isThinking={true} />
                  ) : (
                    <div className="gc-msg-bubble gc-msg-bubble-ai">
                      {/* Done badge or Active thought above content */}
                      {(thinkingTime || thought) && (
                        <ThinkingWidget isThinking={isThinking} thinkingTime={thinkingTime} thought={thought} />
                      )}

                      {/* Tool activity indicator */}
                      {toolCalls && toolCalls.length > 0 && (
                        <details className="gc-tool-activity">
                          <summary className="gc-tool-activity-summary">
                            <span className="gc-tool-activity-icon">📄</span>
                            <span>Read note</span>
                          </summary>
                          <ul className="gc-tool-activity-list">
                            {toolCalls.map((tc, i) => (
                              <li key={i} className="gc-tool-activity-item">
                                <span className="gc-tool-activity-check">✓</span>
                                {tc.tool === "get_note_content" ? "Fetched note content" : tc.tool}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}

                      {/* ── Message content ── */}
                      <div className="gc-markdown max-w-full">
                        {(isActiveStream && isStreaming) ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={markdownComponents}
                          >
                            {displayText}
                          </ReactMarkdown>
                        ) : (
                          <IrisMessageBody segments={msg.segments ?? [{ kind: "text", content: msg.text }]} />
                        )}
                      </div>

                      {isActiveStream && isStreaming && (
                        <span className="gc-cursor" />
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="gc-msg-bubble gc-msg-bubble-user">
                  {msg.text}
                </div>
              )}
            </div>
          );
        })
      )}

      <div ref={bottomRef} />
    </div>
  );
};
