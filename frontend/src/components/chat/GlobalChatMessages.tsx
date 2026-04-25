import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MarkdownCodeBlock from "@/components/chat/MarkdownCodeBlock";
import { GlobalChatEmptyState } from "@/components/chat/GlobalChatEmptyState";
import type { Message } from "@/components/ai/types";

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
}

export const GlobalChatMessages = ({
  messages,
  messagesLoading,
  streamingMessageId,
  streamedMessageText,
  isStreaming,
  isSending,
  sendMessage,
  prompts,
  bottomRef,
}: GlobalChatMessagesProps) => {
  return (
    <div className="gc-messages custom-scrollbar">
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
  );
};


