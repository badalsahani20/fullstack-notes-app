import "katex/dist/katex.min.css";
import { ChevronRight, FileText, Search, Globe, Check } from "lucide-react";
import { GlobalChatEmptyState } from "@/components/chat/GlobalChatEmptyState";
import type { Message } from "@/components/ai/types";
import IrisMessageBody from "./IrisMessageBody";
import { parseIrisResponse } from "@/utils/parseIrisResponse";

// ── Tool label map ───────────────────────────────────────────────────────────
const TOOL_META: Record<string, { icon: React.ReactNode; label: string }> = {
  get_note_content: { icon: <FileText size={12} />, label: "Read note" },
  search_web:       { icon: <Search size={12} />,   label: "Searched the web" },
  crawl_url:        { icon: <Globe size={12} />,    label: "Read webpage" },
};

// --- Thinking Widget ---
interface ThinkingWidgetProps {
  isThinking: boolean;
  thinkingTime?: number;
  thought?: string;
  isReasoningOff?: boolean;
}

const ThinkingWidget = ({ isThinking, thinkingTime, thought, isReasoningOff }: ThinkingWidgetProps) => {
  // If we have thought text, show it in a collapsible detail block
  if (thought) {
    return (
      <details className="iris-thinking-details" open={isThinking}>
        <summary className={`iris-thinking-summary ${!isThinking ? "iris-thinking-summary-done" : ""}`}>
          <ChevronRight size={14} className="iris-chevron" />
          <span>{isThinking ? (isReasoningOff ? "Writing" : "Thinking") : `Thought for ${thinkingTime}s`}</span>
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
        <span>{isReasoningOff ? "Writing" : "Thinking"}</span>
        <span className="iris-thinking-indicator-dots">
          <span style={{ animationDelay: "0ms" }} />
          <span style={{ animationDelay: "180ms" }} />
          <span style={{ animationDelay: "360ms" }} />
        </span>
      </div>
    );
  }

  // Done: closed time badge — no content, nothing to expand
  if (thinkingTime && thinkingTime > 0 && !isReasoningOff) {
    return (
      <div className="iris-thinking-indicator iris-thinking-indicator-done">
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
  useReasoning?: boolean;
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
  useReasoning = true,
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
                    <ThinkingWidget isThinking={true} isReasoningOff={!useReasoning} />
                  ) : (
                    <div className="gc-msg-bubble gc-msg-bubble-ai">
                      {/* 1. Tool activity chips (Top) */}
                      {toolCalls && toolCalls.length > 0 && (
                        <div className="gc-tool-chips">
                          {toolCalls.map((tc, i) => {
                            const meta =
                              TOOL_META[tc.tool] ??
                              ({ icon: <Globe size={12} />, label: tc.tool } as any);
                            const isDone = !isThinking || displayText.length > 0;
                            return (
                              <div
                                key={i}
                                className={`gc-tool-chip${isDone ? "" : " gc-tool-chip-active"}`}
                              >
                                <span className="gc-tool-chip-icon">{meta.icon}</span>
                                <span>{meta.label}</span>
                                {isDone && (
                                  <span className="gc-tool-chip-check">
                                    <Check size={10} strokeWidth={3} />
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 2. Done badge or Active thought (Middle) */}
                      {(thinkingTime || thought) && (
                        <ThinkingWidget
                          isThinking={isThinking}
                          thinkingTime={thinkingTime}
                          thought={thought}
                        />
                      )}

                      {/* 3. Message content (Bottom) */}
                      <div className="gc-markdown max-w-full">
                        <IrisMessageBody
                          segments={msg.segments ?? parseIrisResponse(displayText)}
                          onAnswer={sendMessage}
                        />
                      </div>

                      {isActiveStream && isStreaming && <span className="gc-cursor" />}
                    </div>
                  )}
                </>
              ) : (
                <div className="gc-msg-bubble gc-msg-bubble-user">
                  {msg.imageUrl && (
                    <a
                      href={msg.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="gc-user-image-link"
                    >
                      <img src={msg.imageUrl} alt="Uploaded attachment" className="gc-user-image" />
                    </a>
                  )}
                  {msg.text && <div>{msg.text}</div>}
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
