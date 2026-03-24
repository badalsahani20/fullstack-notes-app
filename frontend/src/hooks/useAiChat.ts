import { useEffect, useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import api from "@/lib/api";
import { useNoteQuery } from "@/hooks/useNotesQuery";
import { useUpdateNoteMutation } from "@/hooks/useNotesMutations";
import type { AiAction, AssistResult, SelectionRange, Message, ChatHistoryMessage } from "@/components/ai/types";
import { stripHtml } from "@/utils/stripHtml";

const getSelection = (editor: Editor | null) => {
  if (!editor) return { text: "", range: null as SelectionRange };
  const { from, to } = editor.state.selection;
  const text = editor.state.doc.textBetween(from, to, " ").trim();
  return { text, range: from !== to ? { from, to } : null };
};

const getActiveNoteSection = (note: string, cursorPosition: number) => {
  const windowSize = 500;
  const start = Math.max(0, cursorPosition - windowSize);
  const end = Math.min(note.length, cursorPosition + windowSize);
  return note.slice(start, end);
};

const resolveNoteContext = (editor: Editor | null, noteText: string) => {
  if (!editor) return noteText.slice(0, 800);
  const { text, range } = getSelection(editor);
  if (range && text) return text;
  const cursor = editor.state.selection.from;
  return getActiveNoteSection(noteText, cursor);
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useAiChat — owns all state, side effects, and API calls for the AI panel.
 *
 * The panel component (AiAuditPanel) becomes a thin glue layer:
 * it calls this hook, destructures the returned values, and passes them
 * to the child display components.
 *
 * @param noteId      - ID of the currently open note
 * @param noteContent - Raw HTML content of the note (used for AI context)
 * @param editor      - TipTap editor instance (used for selection tracking)
 */
export const useAiChat = (noteId: string, noteContent: string, editor: Editor | null) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", text: "Ask about the current note or use the quick actions below to refine it." },
  ]);
  const [chatHistory, setChatHistory] = useState<ChatHistoryMessage[]>([]);
  const [loadingAction, setLoadingAction] = useState<AiAction | null>(null);
  const [result, setResult] = useState<AssistResult | null>(null);
  const [selectionRange, setSelectionRange] = useState<SelectionRange>(null);
  const [streamedMessageText, setStreamedMessageText] = useState("");
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const isNew = noteId === "new";
  const { data: activeNote } = useNoteQuery(isNew ? "" : noteId);

  const { mutateAsync: updateNoteAsync } = useUpdateNoteMutation();

  // ── Refs ───────────────────────────────────────────────────────────────────
  // Tracks the last note context we sent to the AI so we know when it changed
  const lastSentContextRef = useRef("");
  // Lets us cancel in-flight requests when the user hits Stop
  const abortControllerRef = useRef<AbortController | null>(null);

  // ── Derived values ─────────────────────────────────────────────────────────
  const plainNoteText = useMemo(() => stripHtml(noteContent), [noteContent]);

  // ── Effects ────────────────────────────────────────────────────────────────

  // Load chat history from the database when the user explicitly requests it
  const loadHistory = () => {
    if (activeNote?.chatHistory && activeNote.chatHistory.length > 0) {
      const historicMessages = activeNote.chatHistory.map((m: any) => ({
        id: m.id || `${Date.now()}-${Math.random()}`,
        role: m.role,
        text: m.content as string,
        skipAnimation: true, // New flag
      }));

      setMessages((prev) => {
        // Keep the welcome message at the top, then historic messages, then current messages
        const welcomeMessage = prev.find((m) => m.id === "welcome");
        const otherMessages = prev.filter((m) => m.id !== "welcome");
        return [
          ...(welcomeMessage ? [welcomeMessage] : []),
          ...historicMessages,
          ...otherMessages,
        ];
      });

      setChatHistory(
        activeNote.chatHistory.map((m: any) => ({
          role: m.role as "system" | "user" | "assistant",
          content: m.content,
        }))
      );
      setHistoryLoaded(true);
    }
  };

  useEffect(() => {
    setHistoryLoaded(false);
    setMessages([
      { id: "welcome", role: "assistant", text: "Hi! How can i help you today?" },
    ]);
    setChatHistory([]);
  }, [noteId]);

  // Track editor selection so the context indicator updates in real time
  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      const { range } = getSelection(editor);
      setSelectionRange(range);
    };

    editor.on("selectionUpdate", handleSelectionUpdate);
    handleSelectionUpdate(); // run once immediately to capture any existing selection

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor]);

  // Typewriter streaming animation — fires whenever a new assistant message arrives
  useEffect(() => {
    const latestMessage = messages[messages.length - 1];

    if (!latestMessage || latestMessage.role !== "assistant" || latestMessage.id === "welcome" || latestMessage.skipAnimation) {
      setStreamingMessageId(null);
      setStreamedMessageText("");
      setIsStreaming(false);
      return;
    }

    setCopied(false);
    setIsStreaming(true);
    setStreamingMessageId(latestMessage.id);
    setStreamedMessageText("");

    // Adaptive step size: longer messages advance faster so they finish in ~1.7s
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

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Cancels any in-flight API request */
  const stopRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  /** Runs one of the quick-action presets (Improve, Summarize, Brainstorm, Rewrite) directly into the editor */
  const runAction = async (action: AiAction) => {
    const { text: selectedText, range } = getSelection(editor);
    const sourceText = selectedText || plainNoteText;

    if (!sourceText) {
      toast.error("No text found to process. Add content or select text first.");
      return;
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoadingAction(action);
      const res = await api.post(
        "/ai/assist",
        { noteId, action, selectedText: selectedText || undefined, noteText: sourceText },
        { signal: abortControllerRef.current.signal }
      );

      const data = res.data?.data ?? null;

      if (data?.suggestion) {
        setResult({ ...data, action });
        
        // Capture the target range for later application (used by dialogs)
        const targetRange = range || { from: editor?.state.selection.from || 0, to: editor?.state.selection.to || 0 };
        setSelectionRange(targetRange);

        // Grammar and Continue are "inline" actions
        const isInline = action === "grammar" || action === "continue";

        if (isInline && editor) {
          const isContinue = action === "continue";
          const insertPos = isContinue ? targetRange.to : targetRange.from;

          const chain = editor.chain().focus();
          if (!isContinue) {
            chain.deleteRange(targetRange);
          }

          chain
            .insertContentAt(insertPos, `<span data-ai-ghost="true">${data.suggestion}</span>`)
            .setTextSelection({ from: insertPos, to: insertPos + data.suggestion.length })
            .run();
        }
      } else {
        toast.error("No suggestion returned.");
      }
    } catch (error) {
      if (error && typeof error === "object" && "name" in error && error.name === "CanceledError") {
        toast.message("Request cancelled.");
        return;
      }
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError?.response?.data?.message || "AI action failed. Please try again.";
      const status = axiosError?.response?.status;

      if (status === 429 || /quota|rate limit|too many requests/i.test(message)) {
        toast.error("AI Daily Limit Reached", {
          description: "You've hit the free tier limit for AI requests. Please try again later.",
          duration: 5000,
        });
      } else {
        toast.error(message);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  /** Builds the payload for a chat message, including the relevant note context */
  const buildChatHistory = (nextPrompt: string) => {
    const noteContext = resolveNoteContext(editor, plainNoteText);
    const normalizedContext = noteContext.trim().slice(0, 1500);
    const contextChanged = Boolean(normalizedContext && normalizedContext !== lastSentContextRef.current);

    if (contextChanged) {
      lastSentContextRef.current = normalizedContext;
    }

    // Trim to last 6 entries before sending — the server trims to 6 too, but Groq
    // counts tokens on the full payload we send, before any server-side trimming.
    // Keeping this lean prevents hitting the TPM limit on models like llama-3.1-8b-instant.
    const trimmedHistory = chatHistory.slice(-6);

    return { history: trimmedHistory, message: nextPrompt, noteContext: normalizedContext, contextChanged };
  };

  /** Sends the current chatInput as a message to the AI */
  const sendChatMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || isSendingChat) return;

    const userMessage: Message = { id: `${Date.now()}-chat-user`, role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");

    try {
      abortControllerRef.current = new AbortController();
      setIsSendingChat(true);

      const { history, message, noteContext, contextChanged } = buildChatHistory(trimmed);
      const res = await api.post(
        "/ai/chat",
        { message, history, noteContext, contextChanged },
        { signal: abortControllerRef.current.signal }
      );

      const reply = res.data?.data?.reply?.trim() || "No reply returned.";
      const nextHistory = Array.isArray(res.data?.data?.history) ? res.data.data.history : history;
      setChatHistory(nextHistory);

      const assistantMessage: Message = { id: `${Date.now()}-chat-assistant`, role: "assistant", text: reply };
      setResult(null);
      setMessages((prev) => [...prev, assistantMessage]);

      // Persist to DB — cap at 50 messages to prevent BSON size bloat
      const dbHistory = [
        ...(activeNote?.chatHistory || []),
        { id: userMessage.id, role: "user", content: userMessage.text },
        { id: assistantMessage.id, role: "assistant", content: assistantMessage.text },
      ].slice(-50);
      if (activeNote) {
        void updateNoteAsync({ noteId, updates: { chatHistory: dbHistory as any }, version: activeNote.version });
      }

    } catch (error) {
      if (error && typeof error === "object" && "name" in error && error.name === "CanceledError") {
        setChatInput(trimmed); // restore their draft
        setMessages((prev) => prev.slice(0, -1)); // remove the optimistic user message
        return;
      }
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError?.response?.data?.message || "Chat request failed. Please try again.";
      const status = axiosError?.response?.status;

      if (status === 429 || /quota|rate limit|too many requests/i.test(message)) {
        toast.error("AI Daily Limit Reached", {
          description: "You've hit the free tier limit for AI requests. Please try again later.",
          duration: 5000,
        });
      }

      setChatHistory((prev) => [...prev, { role: "user", content: trimmed }]);
      setMessages((prev) => [...prev, { id: `${Date.now()}-chat-error`, role: "assistant", text: message }]);
    } finally {
      setIsSendingChat(false);
    }
  };

  /** Clears the current session and DB history for this note */
  const startNewChat = async () => {
    setMessages([
      { id: "welcome", role: "assistant", text: "Hi! How can i help you today?" },
    ]);
    setChatHistory([]);
    setHistoryLoaded(false);
    if (activeNote) {
      void updateNoteAsync({ noteId, updates: { chatHistory: [] }, version: activeNote.version });
    }
    toast.success("Chat history cleared");
  };

  /** Replaces the selected text in the editor with the AI suggestion */
  const applySuggestionToSelection = () => {
    if (!editor || !result?.suggestion || !selectionRange) return;
    
    const isDialogAction = ["summarize", "explain", "rewrite"].includes(result.action);
    const content = isDialogAction 
      ? result.suggestion 
      : `<span data-ai-ghost="true">${result.suggestion}</span>`;

    editor.chain()
      .focus()
      .insertContentAt(selectionRange, content)
      .run();
  };

  /** Copies the latest AI suggestion to the clipboard */
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

  const hasHistory = (activeNote?.chatHistory?.length ?? 0) > 0 && !historyLoaded;
  const historyCount = activeNote?.chatHistory?.length ?? 0;

  // ── Return everything the panel and its children need ──────────────────────
  return {
    // Message list state
    messages,
    streamingMessageId,
    streamedMessageText,
    isStreaming,
    result,
    selectionRange,
    copied,
    hasHistory,
    historyCount,
    // Compose bar state
    chatInput,
    setChatInput,
    loadingAction,
    isSendingChat,
    // Actions
    sendChatMessage,
    stopRequest,
    runAction,
    copySuggestion,
    applySuggestionToSelection,
    loadHistory,
    startNewChat,
    setResult,
  };
};
