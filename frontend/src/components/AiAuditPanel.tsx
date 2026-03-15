import { useEffect, useMemo, useState } from "react";
import type { Editor } from "@tiptap/react";
import type { AxiosError } from "axios";
import { Bot, Check, CheckCheck, Copy, X } from "lucide-react";
import api from "@/lib/api";

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

const AiAuditPanel = ({ noteId, noteContent, editor, onClose }: AiAuditPanelProps) => {
  const [loadingAction, setLoadingAction] = useState<AiAction | null>(null);
  const [result, setResult] = useState<AssistResult | null>(null);
  const [selectionRange, setSelectionRange] = useState<SelectionRange>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [streamedSuggestion, setStreamedSuggestion] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Use the quick actions below to work with the current note.",
    },
  ]);

  const plainNoteText = useMemo(() => stripHtml(noteContent), [noteContent]);

  useEffect(() => {
    setCopied(false);
    const text = result?.suggestion ?? errorMessage ?? "";
    if (!text) {
      setStreamedSuggestion("");
      setIsStreaming(false);
      return;
    }

    setIsStreaming(true);
    setStreamedSuggestion("");

    const step = Math.max(4, Math.ceil(text.length / 120));
    let index = 0;

    const timer = window.setInterval(() => {
      index = Math.min(text.length, index + step);
      setStreamedSuggestion(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(timer);
        setIsStreaming(false);
      }
    }, 14);

    return () => window.clearInterval(timer);
  }, [errorMessage, result?.suggestion]);

  const runAction = async (action: AiAction) => {
    const { text: selectedText, range } = getSelection(editor);
    const sourceText = selectedText || plainNoteText;

    if (!sourceText) {
      const message = "No text found to process. Add content or select text first.";
      setErrorMessage(message);
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

    try {
      setLoadingAction(action);
      const res = await api.post("/ai/assist", {
        noteId,
        action,
        selectedText: selectedText || undefined,
        noteText: sourceText,
      });

      const data = res.data?.data ?? null;
      setSelectionRange(range);
      setResult(data);
      setErrorMessage(null);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          text: data?.suggestion || "No suggestion returned.",
        },
      ]);
    } catch (error) {
      const message =
        (error as AxiosError<{ message?: string }>)?.response?.data?.message || "AI action failed. Please try again.";
      setErrorMessage(message);
      setResult(null);
      setMessages((current) => [...current, { id: `${Date.now()}-assistant-error`, role: "assistant", text: message }]);
    } finally {
      setLoadingAction(null);
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
      <div className="assistant-rail-header assistant-rail-header-row">
        <h3 className="assistant-panel-title">AI Assistant</h3>
        <button type="button" className="assistant-close-button" onClick={onClose} aria-label="Close AI panel">
          <X size={16} />
        </button>
      </div>

      <div className="assistant-identity">
        <div className="assistant-avatar">
          <Bot size={15} />
        </div>
        <div>
          <p className="font-semibold text-[var(--text-strong)]">AI Assistant</p>
          <p className="text-sm text-[var(--muted-text)]">Available actions for the current note.</p>
        </div>
      </div>

      <div className="custom-scrollbar assistant-message-list">
        {messages.map((message, index) => {
          const isLatestAssistant = message.role === "assistant" && index === messages.length - 1;

          const isStreamed = isLatestAssistant && (streamedSuggestion || isStreaming);

          return (
            <div key={message.id} className={`assistant-message assistant-message-${message.role}`}>
              <div>
                {isStreamed ? streamedSuggestion : message.text}
                {isLatestAssistant && isStreaming ? <span className="assistant-cursor" /> : null}
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
        <div className="assistant-quick-actions">
          {(Object.keys(actionMeta) as AiAction[]).map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => runAction(action)}
              disabled={loadingAction !== null}
              className={`assistant-quick-pill ${loadingAction === action ? "assistant-quick-pill-active" : ""}`}
            >
              {actionMeta[action].label}
            </button>
          ))}
        </div>
        <div className="assistant-compose-note">More assistant actions can be added here once the feature is available.</div>
      </div>
    </aside>
  );
};

export default AiAuditPanel;
