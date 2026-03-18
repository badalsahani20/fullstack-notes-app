import { useEffect, useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import type { AxiosError } from "axios";
import { Check, CheckCheck, Copy, X, Square, Type, FileText, Wand2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import ReactMarkdown from "react-markdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNoteStore } from "@/store/useNoteStore";

type AiAction = "grammar" | "summarize" | "explain" | "rewrite";

type AssistResult = {
  action: AiAction;
  suggestion: string;
  errors: Array<{ start: number; end: number; original: string; suggestion: string | null }>;
  sourceType: "selection" | "note";
};

type SelectionRange = { from: number; to: number } | null;

type AiAuditPanelProps = {
  noteId: string;
  noteContent: string;
  editor: Editor | null;
  onClose: () => void;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type ChatHistoryMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const AI_PANEL_GUIDE_KEY = "ai-panel-guide-seen";

const actionMeta: Record<AiAction, { label: string; prompt: string }> = {
  grammar: {
    label: "Improve",
    prompt: "Clean up grammar, punctuation, and small wording issues in this note.",
  },
  summarize: {
    label: "Summarize",
    prompt: "Summarize the key ideas from this note into a concise explanation.",
  },
  explain: {
    label: "Brainstorm",
    prompt: "Explain this note in simpler language with clear takeaways.",
  },
  rewrite: {
    label: "Rewrite",
    prompt: "Rewrite this note for clarity and better flow while keeping meaning intact.",
  },
};

const stripHtml = (html = "") =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getSelection = (editor: Editor | null) => {
  if (!editor) return { text: "", range: null as SelectionRange };
  const { from, to } = editor.state.selection;
  const text = editor.state.doc.textBetween(from, to, " ").trim();

  return {
    text,
    range: from !== to ? { from, to } : null,
  };
};

const getActiveNoteSection = (note: string, cursorPosition: number) => {
  const windowSize = 500;

  const start = Math.max(0, cursorPosition - windowSize);
  const end = Math.min(note.length, cursorPosition + windowSize);

  return note.slice(start, end);
};

const resolveNoteContext = (editor: Editor | null, noteText: string) => {
  if(!editor) return noteText.slice(0, 800);
  const {text, range} = getSelection(editor);

  if(range && text) {
    return text;
  }

  const cursor = editor.state.selection.from;
  return getActiveNoteSection(noteText, cursor);
}

const AiAuditPanel = ({ noteId, noteContent, editor, onClose }: AiAuditPanelProps) => {
  const [loadingAction, setLoadingAction] = useState<AiAction | null>(null);
  const [result, setResult] = useState<AssistResult | null>(null);
  const [selectionRange, setSelectionRange] = useState<SelectionRange>(null);
  const [streamedMessageText, setStreamedMessageText] = useState("");
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const { notes, updateNote } = useNoteStore();
  const activeNote = useMemo(() => notes.find((n: any) => n._id === noteId), [notes, noteId]);

  const [guideOpen, setGuideOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Ask about the current note or use the quick actions below to refine it.",
    },
  ]);
  const [chatHistory, setChatHistory] = useState<ChatHistoryMessage[]>([]);
  
  // Initialize from database
  useEffect(() => {
    if (activeNote?.chatHistory && activeNote.chatHistory.length > 0) {
      setMessages([
        { id: "welcome", role: "assistant", text: "Ask about the current note or use the quickActions below to refine it." },
        ...activeNote.chatHistory.map((m: any) => ({ id: m.id || `${Date.now()}-${Math.random()}`, role: m.role, text: m.content as string }))
      ]);
      setChatHistory(activeNote.chatHistory.map((m: any) => ({ role: m.role as "system" | "user" | "assistant", content: m.content })));
    }
  }, [noteId]); // Only run on mount or note change, not on every activeNote update

  const messageListRef = useRef<HTMLDivElement | null>(null);
  const lastSentContextRef = useRef("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Dynamically track selection changes for the UI context indicator
  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      const { range } = getSelection(editor);
      setSelectionRange(range);
    };

    editor.on("selectionUpdate", handleSelectionUpdate);
    // Initial check
    handleSelectionUpdate();

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor]);

  const plainNoteText = useMemo(() => stripHtml(noteContent), [noteContent]);

  useEffect(() => {
    const container = messageListRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [messages, streamedMessageText]);

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];

    if (!latestMessage || latestMessage.role !== "assistant" || latestMessage.id === "welcome") {
      setStreamingMessageId(null);
      setStreamedMessageText("");
      setIsStreaming(false);
      return;
    }

    setCopied(false);
    setIsStreaming(true);
    setStreamingMessageId(latestMessage.id);
    setStreamedMessageText("");

    const step = Math.max(4, Math.ceil(latestMessage.text.length / 120));
    let index = 0;

    const timer = window.setInterval(() => {
      index = Math.min(latestMessage.text.length, index + step);
      setStreamedMessageText(latestMessage.text.slice(0, index));

      if (index >= latestMessage.text.length) {
        window.clearInterval(timer);
        setIsStreaming(false);
      }
    }, 14);

    return () => window.clearInterval(timer);
  }, [messages]);

  useEffect(() => {
    const seenGuide = window.localStorage.getItem(AI_PANEL_GUIDE_KEY);
    if (!seenGuide) {
      setGuideOpen(true);
    }
  }, []);

  const stopRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const runAction = async (action: AiAction) => {
    const { text: selectedText, range } = getSelection(editor);
    const sourceText = selectedText || plainNoteText;

    if (!sourceText) {
      const message = "No text found to process. Add content or select text first.";
      setMessages((current) => [...current, { id: `${Date.now()}-error`, role: "assistant", text: message }]);
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-user`,
        role: "user",
        text: actionMeta[action].label,
      },
    ]);

    abortControllerRef.current = new AbortController();

    try {
      setLoadingAction(action);
      const res = await api.post("/ai/assist", {
        noteId,
        action,
        selectedText: selectedText || undefined,
        noteText: sourceText,
      }, {
        signal: abortControllerRef.current.signal
      });

      const data = res.data?.data ?? null;
      setSelectionRange(range);
      setResult(data);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          text: data?.suggestion || "No suggestion returned.",
        },
      ]);
    } catch (error) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'CanceledError') {
        setMessages((current) => [...current, { id: `${Date.now()}-assistant-cancelled`, role: "assistant", text: "Request cancelled." }]);
        setResult(null);
        return;
      }
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError?.response?.data?.message || "AI action failed. Please try again.";
      const status = axiosError?.response?.status;
      
      const isRateLimit = status === 429 || /quota|rate limit|too many requests/i.test(message);
      if (isRateLimit) {
        toast.error("AI Daily Limit Reached", {
          description: "You've hit the free tier limit for AI requests. Please try again later.",
          duration: 5000,
        });
      }

      setResult(null);
      setMessages((current) => [...current, { id: `${Date.now()}-assistant-error`, role: "assistant", text: message }]);
    } finally {
      setLoadingAction(null);
    }
  };

  const buildChatHistory = (nextPrompt: string) => {
    // const { text: selectedText } = getSelection(editor);
    const noteContext = resolveNoteContext(editor, plainNoteText);
    const normalizedContext = noteContext.trim().slice(0, 1500);
    const contextChanged = Boolean(normalizedContext && normalizedContext !== lastSentContextRef.current);

    if (contextChanged) {
      lastSentContextRef.current = normalizedContext;
    }

    return {
      history: chatHistory,
      message: nextPrompt,
      noteContext: normalizedContext,
      contextChanged,
    };
  };

  const sendChatMessage = async () => {
    const trimmed = chatInput.trim();

    if (!trimmed || isSendingChat) {
      return;
    }

    const userMessage: Message = {
      id: `${Date.now()}-chat-user`,
      role: "user",
      text: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setChatInput("");

    try {
      abortControllerRef.current = new AbortController();
      setIsSendingChat(true);
      const { history, message, noteContext, contextChanged } = buildChatHistory(trimmed);
      const res = await api.post("/ai/chat", {
        message,
        history,
        noteContext,
        contextChanged,
      }, {
        signal: abortControllerRef.current.signal
      });

      const reply = res.data?.data?.reply?.trim() || "No reply returned.";
      const nextHistory = Array.isArray(res.data?.data?.history) ? res.data.data.history : history;
      setChatHistory(nextHistory);
      
      const assistantMessage: Message = {
         id: `${Date.now()}-chat-assistant`,
         role: "assistant",
         text: reply,
      };

      setResult(null);
      setMessages((current) => [...current, assistantMessage]);

      // Save to database (limit to 50 most recent to prevent BSON size bloat)
      const dbHistory = [
        ...(activeNote?.chatHistory || []),
        { id: userMessage.id, role: "user", content: userMessage.text },
        { id: assistantMessage.id, role: "assistant", content: assistantMessage.text }
      ].slice(-50);
      void updateNote(noteId, { chatHistory: dbHistory as any });

    } catch (error) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'CanceledError') {
        setChatInput(trimmed); // Give them their draft back
        setMessages((current) => current.slice(0, -1)); // Remove the user's optimistic sent message UI
        return;
      }
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError?.response?.data?.message || "Chat request failed. Please try again.";
      const status = axiosError?.response?.status;
      
      const isRateLimit = status === 429 || /quota|rate limit|too many requests/i.test(message);
      if (isRateLimit) {
        toast.error("AI Daily Limit Reached", {
          description: "You've hit the free tier limit for AI requests. Please try again later.",
          duration: 5000,
        });
      }

      setChatHistory((current) => [...current, { role: "user", content: trimmed }]);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-chat-error`,
          role: "assistant",
          text: message,
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const applySuggestionToSelection = () => {
    if (!editor || !result?.suggestion || !selectionRange) return;

    editor.chain().focus().insertContentAt(selectionRange, result.suggestion).run();
  };

  const copySuggestion = async () => {
    if (!result?.suggestion) return;
    try {
      await navigator.clipboard.writeText(result.suggestion);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <aside className="assistant-rail hidden xl:flex">
      <Dialog
        open={guideOpen}
        onOpenChange={(open) => {
          setGuideOpen(open);
          if (!open) {
            window.localStorage.setItem(AI_PANEL_GUIDE_KEY, "true");
          }
        }}
      >
        <DialogContent className="desktop-dialog max-w-sm border-zinc-800 bg-zinc-950 text-zinc-100">
          <DialogHeader>
            <DialogTitle>How to use AI Assistant</DialogTitle>
          </DialogHeader>
          <div className="assistant-guide-list">
            <p>Ask a question to chat about the current note.</p>
            <p>Select text first if you want help with a specific section.</p>
            <p>Use the quick actions for fast rewrite, summary, or improvement passes.</p>
          </div>
        </DialogContent>
      </Dialog>

      <div className="assistant-rail-header assistant-rail-header-row">
        <h3 className="assistant-panel-title">AI Assistant</h3>
        <button type="button" className="assistant-close-button" onClick={onClose} aria-label="Close AI panel">
          <X size={16} />
        </button>
      </div>

      <div ref={messageListRef} className="custom-scrollbar assistant-message-list">
        {messages.map((message, index) => {
          const isStreamed = message.id === streamingMessageId && (streamedMessageText || isStreaming);

          return (
            <div key={message.id} className={`assistant-message assistant-message-${message.role}`}>
              <div className="max-w-full overflow-hidden">
                {isStreamed ? (
                  <div className="prose prose-sm dark:prose-invert max-w-full overflow-hidden prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-pre:max-w-full prose-pre:overflow-x-auto break-words">
                    <ReactMarkdown>{String(streamedMessageText || "")}</ReactMarkdown>
                  </div>
                ) : message.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-full overflow-hidden prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-pre:max-w-full prose-pre:overflow-x-auto break-words">
                    <ReactMarkdown>{String(message.text || "")}</ReactMarkdown>
                  </div>
                ) : (
                  message.text
                )}
                {message.id === streamingMessageId && isStreaming ? <span className="assistant-cursor" /> : null}
              </div>
              {message.role === "assistant" && !isStreaming && result?.suggestion && index === messages.length - 1 ? (
                <div className="assistant-message-actions">
                  <button type="button" className="assistant-inline-action" onClick={copySuggestion}>
                    {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    type="button"
                    className="assistant-inline-action"
                    onClick={applySuggestionToSelection}
                    disabled={!selectionRange}
                  >
                    <Check size={13} />
                    Replace
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="assistant-compose">
        <div className="assistant-compose-shell">
          <div className="px-3 py-1.5 border-b border-[var(--divider)] flex items-center justify-between gap-2 text-xs font-medium text-[var(--muted-text)] bg-[var(--surface-muted)]">
            <div className="flex items-center gap-2">
              {selectionRange ? (
                <>
                <Type size={12} className="text-[var(--accent-strong)]" />
                <span className="text-[var(--text-strong)]">Selection</span> context
                </>
              ) : (
                <>
                <FileText size={12} />
                Note context
                </>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={loadingAction !== null || isSendingChat}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[var(--surface-ghost)] text-[var(--text-strong)] transition-colors disabled:opacity-50"
                  title="Quick Actions"
                >
                  <Wand2 size={12} className={loadingAction ? "animate-pulse text-[var(--accent-strong)]" : "text-[var(--accent-strong)]"} />
                  {loadingAction ? actionMeta[loadingAction].label : "Actions"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-zinc-950 border-zinc-800 text-zinc-100 shadow-md">
                {(Object.keys(actionMeta) as AiAction[]).map((action) => (
                  <DropdownMenuItem
                    key={action}
                    onClick={() => runAction(action)}
                    className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 focus:text-zinc-100 text-sm py-1.5 transition-colors"
                    title={actionMeta[action].prompt}
                  >
                    {actionMeta[action].label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <textarea
            className="assistant-compose-input custom-scrollbar"
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            placeholder="Ask about this note, get ideas, or request edits..."
            rows={4}
            disabled={isSendingChat}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendChatMessage();
              }
            }}
          />
          <div className="assistant-compose-footer">
            {isSendingChat || loadingAction ? (
              <button
                type="button"
                className="assistant-send-button bg-[var(--surface-ghost)] hover:bg-[var(--surface-hover)] text-[var(--text-strong)] border-[var(--divider)]"
                onClick={stopRequest}
                title="Stop AI Request"
              >
                <Square size={13} fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                className="assistant-send-button"
                onClick={() => void sendChatMessage()}
                disabled={!chatInput.trim()}
              >
                -&gt;
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AiAuditPanel;
