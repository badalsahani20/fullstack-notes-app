import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useGlobalChatStore } from "@/store/useGlobalChatStore";
import { useTypewriter } from "@/hooks/useTypewriter";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Message } from "@/components/ai/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MarkdownCodeBlock from "@/components/chat/MarkdownCodeBlock";
import {
  ArrowUp,
  Bot,
  ImageIcon,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Square,
  X,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

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

/* ─── Helpers ─────────────────────────────────── */
const timeAgo = (iso: string) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

/* ─── Empty state ─────────────────────────────── */
const EmptyState = ({ onChipClick }: { onChipClick: (text: string) => void }) => (
  <div className="gc-empty">
    <div className="gc-empty-orb ai-rail-button ai-rail-button-active !w-20 !h-20 !rounded-3xl mx-auto cursor-default font-medium">
      <div className="iris-orb iris-orb-lg" />
    </div>
    <h2 className="gc-empty-title">Ask Iris anything</h2>
    <p className="gc-empty-sub">
      Your AI learning companion. Ask questions, explore ideas,
      <br /> or dig into any topic — no note needed.
    </p>
    <div className="gc-empty-chips">
      {[
        "Explain Big O notation",
        "Help me outline an essay",
        "What is the CAP theorem?",
        "Summarize quantum entanglement",
      ].map((s) => (
        <button key={s} className="gc-chip" onClick={() => onChipClick(s)}>
          {s}
        </button>
      ))}
    </div>
  </div>
);

/* ─── Main Page ───────────────────────────────── */
const GlobalChatPage = () => {
  const {
    sessions, sessionsLoading,
    activeSessionId, messages, messagesLoading,
    isSending, attachedImage, imageDisabled,
    fetchSessions, loadSession, startNewChat, sendMessage, setAttachedImage,
  } = useGlobalChatStore();

  const [input, setInput] = useState("");

  const isMobile = useMediaQuery("(max-width: 960px)");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Shared typewriter hook — no skip IDs needed for global chat
  const { streamingMessageId, streamedMessageText, isStreaming } = useTypewriter(
    messages as Message[],
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = () => {
    const text = input.trim();
    if (!text && !attachedImage) return;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    sendMessage(text, attachedImage);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setAttachedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleImageClick = () => {
    if (imageDisabled) {
      toast.error("Image analysis is temporarily unavailable. Try again later.");
      return;
    }
    fileRef.current?.click();
  };

  return (
    <div className="gc-shell">
      {/* Sidebar — desktop inline / mobile overlay */}
      {(isMobile && sidebarOpen) && (
        <div 
          className="gc-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        "gc-sidebar",
        isMobile && "gc-sidebar-mobile",
        sidebarOpen ? "gc-sidebar-expanded" : "gc-sidebar-collapsed"
      )}>
        <div className="gc-sidebar-inner">
          <div className="gc-sidebar-header">
            <div className="gc-sidebar-brand">
              <Bot size={16} />
              <span>Conversations</span>
            </div>
            <button
              className="gc-new-chat-btn"
              onClick={startNewChat}
              title="New chat"
            >
              <MessageSquarePlus size={15} />
              <span>New Chat</span>
            </button>
          </div>

          <div className="gc-session-list custom-scrollbar">
            {sessionsLoading ? (
              <div className="gc-session-skeleton-wrap">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="gc-session-skeleton" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <p className="gc-session-empty">No conversations yet</p>
            ) : (
              sessions.map((session) => (
                <button
                  key={session._id}
                  className={`gc-session-item ${activeSessionId === session._id ? "gc-session-item-active" : ""}`}
                  onClick={() => { loadSession(session._id); if (isMobile) setSidebarOpen(false); }}
                >
                  <span className="gc-session-title">{session.title}</span>
                  <span className="gc-session-time">
                    <Clock size={10} />
                    {timeAgo(session.updatedAt)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* ── Main chat area ── */}
      <div className="gc-main">
        {/* Header */}
        <div className="gc-header">
          {/* Sidebar toggle */}
          <button
            className="gc-icon-btn"
            onClick={() => setSidebarOpen((o) => !o)}
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>

          <div className="gc-header-avatar ai-rail-button ai-rail-button-active cursor-default">
            <div className="iris-orb" />
          </div>
          <div>
            <p className="gc-header-name">Iris</p>
            <p className="gc-header-sub">AI Learning Assistant</p>
          </div>
        </div>

        {/* Messages */}
        <div className="gc-messages custom-scrollbar">
          {messagesLoading ? (
            <div className="gc-loading-wrap">
              <div className="gc-loading-dot" style={{ animationDelay: "0ms" }} />
              <div className="gc-loading-dot" style={{ animationDelay: "150ms" }} />
              <div className="gc-loading-dot" style={{ animationDelay: "300ms" }} />
            </div>
          ) : messages.length === 0 ? (
            <EmptyState onChipClick={(text) => sendMessage(text)} />
          ) : (
            messages.map((msg) => {
              const isActiveStream = msg.id === streamingMessageId;
              const displayText = isActiveStream ? streamedMessageText : msg.text;

              return (
                <div key={msg.id} className={`gc-msg gc-msg-${msg.role}`}>
                  {msg.role === "assistant" ? (
                    <>
                      <div className="gc-msg-bubble gc-msg-bubble-ai">
                        <div className="gc-markdown max-w-full">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{displayText}</ReactMarkdown>
                        </div>
                        {isActiveStream && isStreaming && (
                          <span className="gc-cursor" />
                        )}
                      </div>
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

          {/* Sending indicator */}
          {isSending && (
            <div className="gc-msg gc-msg-assistant">
              <div className="gc-msg-avatar">
                <div className="iris-orb" style={{ width: '14px', height: '14px' }} />
              </div>
              <div className="gc-msg-bubble gc-msg-bubble-ai">
                <div className="gc-thinking">
                  <span className="gc-loading-dot" style={{ animationDelay: "0ms" }} />
                  <span className="gc-loading-dot" style={{ animationDelay: "150ms" }} />
                  <span className="gc-loading-dot" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Compose */}
        <div className="gc-compose-wrap">
          <div className="gc-compose">
            {attachedImage && (
              <div className="gc-img-preview-wrap">
                <div className="gc-img-preview">
                  <img src={attachedImage} alt="Attached" className="gc-img-thumb" />
                  <button className="gc-img-remove" onClick={() => setAttachedImage(null)}>
                    <X size={11} />
                  </button>
                </div>
              </div>
            )}

            <textarea
              ref={textareaRef}
              className="gc-textarea custom-scrollbar"
              placeholder="Ask Iris anything…"
              rows={1}
              value={input}
              disabled={isSending}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 160) + "px";
              }}
            />

            <div className="gc-compose-footer">
              <button
                type="button"
                className={`gc-icon-btn ${imageDisabled ? "gc-icon-btn-disabled" : ""}`}
                onClick={handleImageClick}
                title={imageDisabled ? "Image unavailable" : "Attach image"}
              >
                <ImageIcon size={15} />
              </button>
              <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleFileChange} />

              {isSending ? (
                <button type="button" className="gc-send-btn gc-send-btn-stop">
                  <Square size={13} fill="currentColor" />
                </button>
              ) : (
                <button
                  type="button"
                  className="gc-send-btn"
                  disabled={!input.trim() && !attachedImage}
                  onClick={handleSend}
                >
                  <ArrowUp size={15} />
                </button>
              )}
            </div>
          </div>
          <p className="gc-disclaimer">Iris can make mistakes. Double-check important info.</p>
        </div>
      </div>
    </div>
  );
};

export default GlobalChatPage;
