import "katex/dist/katex.min.css";
import { ChevronRight, FileText, Search, Globe, Check, Copy } from "lucide-react";
import { GlobalChatEmptyState } from "@/components/chat/GlobalChatEmptyState";
import type { Message } from "@/components/ai/types";
import IrisMessageBody from "./IrisMessageBody";
import { parseIrisResponse } from "@/utils/parseIrisResponse";
import { useEffect, useState } from "react";
import { getThinkingState } from "@/utils/getThinkingState";


// --- Thinking Widget ---
interface ThinkingWidgetProps {
  isThinking: boolean;
  thinkingTime?: number;
  thought?: string;
  isReasoningOff?: boolean;
}


const ThinkingWidget = ({ isThinking, thinkingTime, thought, isReasoningOff }: ThinkingWidgetProps) => {
  // If we have thought text, show it in a collapsible detail block
  const [thinking, setThinking] = useState(getThinkingState());

  useEffect(() => { 
    if(!isThinking) return;

    const interval = setInterval(() => {
      setThinking(getThinkingState());
    }, 2500);
    return () => clearInterval(interval);
  }, [isThinking]);

  if (thought) {
    return (
      <details className="iris-thinking-details" open={isThinking}>
        <summary className={`iris-thinking-summary ${!isThinking ? "iris-thinking-summary-done" : ""}`}>
          <ChevronRight size={14} className="iris-chevron" />
          <span>{isThinking ? (isReasoningOff ? thinking.text : "Thinking") : `Thought for ${thinkingTime}s`}</span>
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
        <span>{isReasoningOff ? thinking.text : "Thinking"}</span>
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Failed to copy text:", err);
    });
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

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
                    toolCalls && toolCalls.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {toolCalls.map((tc, idx) => {
                          let label = "Working...";
                          let icon = <Globe size={14} className="iris-search-indicator-icon" />;
                          if (tc.tool === "search_web") {
                            label = "Searching the web...";
                            icon = <Search size={14} className="iris-search-indicator-icon animate-pulse" />;
                          } else if (tc.tool === "crawl_url") {
                            label = "Reading webpage...";
                            icon = <Globe size={14} className="iris-search-indicator-icon animate-pulse" />;
                          } else if (tc.tool === "get_note_content") {
                            label = "Reading note...";
                            icon = <FileText size={14} className="iris-search-indicator-icon animate-pulse" />;
                          }
                          return (
                            <div key={idx} className="iris-search-indicator-pulse">
                              {icon}
                              <span>{label}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <ThinkingWidget isThinking={true} isReasoningOff={!useReasoning} />
                    )
                  ) : (
                    <div className="gc-msg-bubble gc-msg-bubble-ai">
                      {/* 1. Premium completed tool badges (Top) */}
                      {toolCalls && toolCalls.length > 0 && (
                        <div className="flex flex-col gap-1.5 mb-2">
                          {toolCalls.map((tc, idx) => {
                            let label = tc.tool;
                            let icon = <Globe size={12} className="text-emerald-500" />;
                            if (tc.tool === "search_web") {
                              label = "Searched the web";
                              icon = <Search size={12} className="text-emerald-500" />;
                            } else if (tc.tool === "crawl_url") {
                              label = "Read webpage";
                              icon = <Globe size={12} className="text-emerald-500" />;
                            } else if (tc.tool === "get_note_content") {
                              label = "Read note";
                              icon = <FileText size={12} className="text-emerald-500" />;
                            }
                            return (
                              <div key={idx} className="iris-search-complete-badge">
                                <Check size={12} className="text-emerald-500" />
                                <span className="flex items-center gap-1">
                                  {icon}
                                  {label}
                                </span>
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

                      {/* Copy response button once generation completes */}
                      {!(isActiveStream && isStreaming) && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5 text-white/40">
                          <button
                            onClick={() => handleCopy(displayText, msg.id)}
                            className="p-1 rounded-md hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <Check size={14} className="text-emerald-500" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      )}

                      {isActiveStream && isStreaming && <span className="gc-cursor" />}
                    </div>
                  )}
                </>
              ) : (
                <div className="gc-msg-bubble gc-msg-bubble-user group relative">
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

                  {/* Hover Copy Button */}
                  {msg.text && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -bottom-2 -right-2 flex items-center bg-[#181818] border border-white/10 shadow-xl p-0.5 rounded-md z-10 cursor-pointer">
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors flex items-center justify-center"
                        title="Copy prompt"
                      >
                        {copiedId === msg.id ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  )}
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
