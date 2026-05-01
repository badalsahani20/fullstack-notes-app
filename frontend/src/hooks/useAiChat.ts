import { useEffect, useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import type { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { parseIrisResponse } from "@/utils/parseIrisResponse";
import { useNoteQuery } from "@/hooks/useNotesQuery";
import { useUpdateNoteMutation } from "@/hooks/useNotesMutations";
import type { AiAction, AssistResult, SelectionRange, Message, ChatHistoryMessage } from "@/components/ai/types";
import type { Note } from "@/store/useNoteStore";
import { stripHtml } from "@/utils/stripHtml";

const getSelection = (editor: Editor | null) => {
  if (!editor) return { text: "", range: null as SelectionRange };
  const { from, to } = editor.state.selection;
  const text = editor.state.doc.textBetween(from, to, " ").trim();
  return { text, range: from !== to ? { from, to } : null };
};

const getActiveNoteSection = (note: string, cursorPosition: number) => {
  const windowSize = 4000;
  const start = Math.max(0, cursorPosition - windowSize);
  const end = Math.min(note.length, cursorPosition + windowSize);
  return note.slice(start, end);
};

const resolveNoteContext = (editor: Editor | null, noteText: string) => {
  if (!editor) return {text: noteText.slice(0, 8000), hasSelection: false};
  const { text, range } = getSelection(editor);
  if (range && text) return {text, hasSelection: true};
  const cursor = editor.state.selection.from;
  return {text: getActiveNoteSection(noteText, cursor), hasSelection: false};
};

const getPersistedHistoryFromMessages = (messages: Message[]) =>
  messages
    .filter((message) => message.id !== "welcome")
    .map((message) => ({
      id: message.id,
      role: message.role as "user" | "assistant",
      content: message.text,
      ...(message.role === "assistant" && message.segments ? { segments: message.segments } : {}),
    }))
    .slice(-50);

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
  const queryClient = useQueryClient();
  // ── State ──────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", text: "Ask about the current note or use the quick actions below to refine it." },
  ]);
  const [chatHistory, setChatHistory] = useState<ChatHistoryMessage[]>([]);
  const [loadingAction, setLoadingAction] = useState<AiAction | null>(null);
  const [result, setResult] = useState<AssistResult | null>(null);
  const [selectionRange, setSelectionRange] = useState<SelectionRange>(null);
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Direct streaming state — same pattern as useGlobalChatStore (no typewriter)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamedMessageText, setStreamedMessageText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const isNew = noteId === "new";
  const { data: activeNote } = useNoteQuery(isNew ? "" : noteId);

  const { mutateAsync: updateNoteAsync } = useUpdateNoteMutation();

  // ── Refs ───────────────────────────────────────────────────────────────────
  // Tracks the last note context we sent to the AI so we know when it changed
  const lastSentContextRef = useRef("");
  // Lets us cancel in-flight requests when the user hits Stop
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>(messages);

  // ── Derived values ─────────────────────────────────────────────────────────
  const plainNoteText = useMemo(() => stripHtml(noteContent), [noteContent]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // ── Effects ────────────────────────────────────────────────────────────────

  // Load chat history from the database when the user explicitly requests it
  const loadHistory = () => {
    if (activeNote?.chatHistory && activeNote.chatHistory.length > 0) {
      const historicMessages = activeNote.chatHistory.map((m: any) => ({
        id: m.id || `${Date.now()}-${Math.random()}`,
        role: m.role,
        text: m.content as string,
        segments: m.segments,
        skipAnimation: true,
      }));

      const nextMessages = ((prev: Message[]) => {
        // Keep the welcome message at the top, then historic messages, then current messages
        const welcomeMessage = prev.find((m) => m.id === "welcome");
        const otherMessages = prev.filter((m) => m.id !== "welcome");
        return [
          ...(welcomeMessage ? [welcomeMessage] : []),
          ...historicMessages,
          ...otherMessages,
        ];
      })(messagesRef.current);

      messagesRef.current = nextMessages;
      setMessages(nextMessages);

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
    const nextMessages: Message[] = [
      { id: "welcome", role: "assistant", text: "Hi! How can i help you today?" },
    ];
    messagesRef.current = nextMessages;
    setMessages(nextMessages);
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
    const sourceText = selectedText || editor?.getText() || plainNoteText;

    if (!sourceText) {
      toast.error("No text found to process. Add content or select text first.");
      return;
    }

    abortControllerRef.current = new AbortController();
    const isDialogAction = ["summarize", "explain", "rewrite"].includes(action);
    const targetRange = range || { from: editor?.state.selection.from || 0, to: editor?.state.selection.to || 0 };

    try {
      setLoadingAction(action);

      if (isDialogAction) {
        // ── Streaming path for dialog actions ───────────────────────────
        const { accessToken } = useAuthStore.getState();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/ai/assist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            noteId,
            action,
            selectedText: selectedText || undefined,
            noteText: sourceText,
            stream: true,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) throw new Error("AI action failed. Please try again.");
        if (!response.body) throw new Error("No response body");

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("text/event-stream")) {
          // ── Cached response path — backend returned JSON even for stream:true ──
          const json = await response.json();
          const suggestion = json?.data?.suggestion ?? "";
          if (suggestion) {
            setSelectionRange(targetRange);
            setResult({
              action,
              suggestion,
              errors: json?.data?.errors ?? [],
              sourceType: selectedText ? "selection" : "note",
              isStreaming: false,
            });
          } else {
            toast.error("No suggestion returned.");
          }
        } else {
          // ── Live SSE stream path ─────────────────────────────────────────
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let fullSuggestion = "";
          let dialogOpened = false;

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ") && line !== "data: [DONE]") {
                try {
                  const data = JSON.parse(line.slice(6));
                  const token = data.choices?.[0]?.delta?.content || "";
                  if (!token) continue;
                  fullSuggestion += token;

                  if (!dialogOpened) {
                    setSelectionRange(targetRange);
                    dialogOpened = true;
                  }

                  setResult({
                    action,
                    suggestion: fullSuggestion,
                    errors: [],
                    sourceType: selectedText ? "selection" : "note",
                    isStreaming: true,
                  });
                } catch { }
              }
            }
          }

          // Mark streaming done
          setResult((prev) => prev ? { ...prev, isStreaming: false } : prev);
        }

      } else {
        // ── Blocking path for inline actions (grammar, continue) ─────────
        const res = await api.post(
          "/ai/assist",
          { noteId, action, selectedText: selectedText || undefined, noteText: sourceText },
          { signal: abortControllerRef.current.signal }
        );

        const data = res.data?.data ?? null;

        if (data?.suggestion) {
          setResult({ ...data, action });
          setSelectionRange(targetRange);

          const isInline = action === "grammar" || action === "continue";
          if (isInline && editor) {
            const isContinue = action === "continue";
            const insertPos = isContinue ? targetRange.to : targetRange.from;
            const chain = editor.chain().focus();
            if (!isContinue) chain.deleteRange(targetRange);
            chain
              .insertContentAt(insertPos, `<span data-ai-ghost="true">${data.suggestion}</span>`)
              .setTextSelection({ from: insertPos, to: insertPos + data.suggestion.length })
              .run();
          }
        } else {
          toast.error("No suggestion returned.");
        }
      }
    } catch (error) {
      if (error && typeof error === "object" && "name" in error && error.name === "CanceledError") {
        toast.message("Request cancelled.");
        return;
      }
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = (error instanceof Error ? error.message : null)
        || axiosError?.response?.data?.message
        || "AI action failed. Please try again.";
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
    const { text: noteContext, hasSelection } = resolveNoteContext(editor, plainNoteText);
    const normalizedContext = noteContext.trim().slice(0, 8000);
    const contextChanged = Boolean(normalizedContext && normalizedContext !== lastSentContextRef.current);

    if (contextChanged) {
      lastSentContextRef.current = normalizedContext;
    }

    // Trim to last 6 entries before sending — the server trims to 6 too, but Groq
    // counts tokens on the full payload we send, before any server-side trimming.
    // Keeping this lean prevents hitting the TPM limit on models like llama-3.1-8b-instant.
    const trimmedHistory = chatHistory.slice(-6);

    return { history: trimmedHistory, message: nextPrompt, noteContext: normalizedContext, hasSelection, contextChanged };
  };

  /** Sends the current chatInput as a message to the AI */
  const sendChatMessage = async () => {
    const trimmed = chatInput.trim();
    if ((!trimmed && !attachedImage) || isSendingChat) return;

    // Default to "Image Context" if they just send an image without text
    const textToSend = trimmed || "Describe this image context.";

    const userMessage: Message = { id: `${Date.now()}-chat-user`, role: "user", text: textToSend };
    const optimisticMessages = [...messagesRef.current, userMessage];
    messagesRef.current = optimisticMessages;
    setMessages(optimisticMessages);
    setChatInput("");
    const sentImage = attachedImage;
    setAttachedImage(null);

    try {
      abortControllerRef.current = new AbortController();
      setIsSendingChat(true);

      const { history: chatHist, message, noteContext, hasSelection } = buildChatHistory(textToSend);
      const { accessToken } = useAuthStore.getState();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message,
          history: chatHist,
          noteId,
          noteContext,
          hasSelection,
          imageBase64: sentImage,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("Failed to connect to AI");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let fullThought = "";
      let lastUpdateTime = 0;
      const THROTTLE_MS = 40;
      let thinkingEndTime = 0;

      // Add assistant message with isThinking:true — same as global chat store
      const aiMsgId = `${Date.now()}-chat-assistant`;
      const streamStartTime = Date.now();
      const initialAssistantMsg: Message = {
        id: aiMsgId,
        role: "assistant",
        text: "",
        isThinking: true,
      };
      setMessages((prev) => [...prev, initialAssistantMsg]);
      messagesRef.current = [...messagesRef.current, initialAssistantMsg];

      // Activate streaming UI — same as global chat store
      setStreamingMessageId(aiMsgId);
      setStreamedMessageText("");
      setIsStreaming(true);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "error") {
                throw new Error(data.message || "AI service error");
              }

              // ── Tool activity event from controller ─────────────────────
              if (data.type === "tool_call" && data.tool) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId
                      ? { ...m, toolCalls: [...(m.toolCalls ?? []), { tool: data.tool }] }
                      : m
                  )
                );
                continue;
              }

              // ── Regular text & reasoning tokens ────────────────────────────────
              const content = data.choices?.[0]?.delta?.content || "";
              const reasoning = data.choices?.[0]?.delta?.reasoning || "";
              
              if (!content && !reasoning) continue;
              
              if (content && fullText.length === 0) {
                // First content token arrived — thinking is done
                thinkingEndTime = Date.now();
              }

              fullText += content;
              fullThought += reasoning;

              const now = Date.now();
              if (now - lastUpdateTime > THROTTLE_MS) {
                const currentThinkingTime = thinkingEndTime 
                  ? Math.floor((thinkingEndTime - streamStartTime) / 1000) 
                  : Math.floor((now - streamStartTime) / 1000);

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId
                      ? { ...m, isThinking: fullText.length === 0, thought: fullThought, thinkingTime: currentThinkingTime }
                      : m
                  )
                );
                setStreamedMessageText(fullText);
                lastUpdateTime = now;
              }
            } catch { }
          }
        }
      }

      // Stream done — finalise
      const segments = parseIrisResponse(fullText);
      const finalThinkingTime = thinkingEndTime 
        ? Math.floor((thinkingEndTime - streamStartTime) / 1000) 
        : (fullThought ? Math.floor((Date.now() - streamStartTime) / 1000) : 0);

      setStreamingMessageId(null);
      setStreamedMessageText("");
      setIsStreaming(false);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, text: fullText, thought: fullThought, segments, isThinking: false, thinkingTime: finalThinkingTime }
            : m
        )
      );
      messagesRef.current = messagesRef.current.map((m) =>
        m.id === aiMsgId ? { ...m, text: fullText, thought: fullThought, segments, isThinking: false, thinkingTime: finalThinkingTime } : m
      );

      setChatHistory((prev) => [...prev, { role: "user", content: textToSend }, { role: "assistant", content: fullText }]);
      setResult(null);

      // Persist to DB
      const persistedMessages = messagesRef.current;
      const dbHistory = getPersistedHistoryFromMessages(persistedMessages);
      const latestNote = (queryClient.getQueryData(["note", noteId]) as Note | undefined) ?? activeNote;
      if (latestNote) {
        void updateNoteAsync({
          noteId,
          updates: { chatHistory: dbHistory as Note["chatHistory"] },
          version: latestNote.version,
        });
      }

    } catch (error) {
      if (error && typeof error === "object" && "name" in error && error.name === "CanceledError") {
        setChatInput(trimmed); // restore their draft
        const rolledBackMessages = messagesRef.current.slice(0, -1);
        messagesRef.current = rolledBackMessages;
        setMessages(rolledBackMessages); // remove the optimistic user message
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
      const errorMessage: Message = { id: `${Date.now()}-chat-error`, role: "assistant", text: message };
      const failedMessages = [...messagesRef.current, errorMessage];
      messagesRef.current = failedMessages;
      setMessages(failedMessages);
    } finally {
      setIsSendingChat(false);
    }
  };

  /** Clears the current session and DB history for this note */
  const startNewChat = async () => {
    const nextMessages: Message[] = [
      { id: "welcome", role: "assistant", text: "Hi! How can i help you today?" },
    ];
    messagesRef.current = nextMessages;
    setMessages(nextMessages);
    setChatHistory([]);
    setHistoryLoaded(false);
    const latestNote = (queryClient.getQueryData(["note", noteId]) as Note | undefined) ?? activeNote;
    if (latestNote) {
      void updateNoteAsync({ noteId, updates: { chatHistory: [] }, version: latestNote.version });
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
    attachedImage,
    setAttachedImage,
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
