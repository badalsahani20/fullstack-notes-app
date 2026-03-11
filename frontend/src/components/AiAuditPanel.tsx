import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Editor } from "@tiptap/react";
import { Bot, Check, CheckCheck, Copy, Sparkles, WandSparkles, X } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
};

const actionMeta: Record<AiAction, { label: string; description: string }> = {
  grammar: { label: "Fix Grammar", description: "Correct grammar, spelling, and punctuation." },
  summarize: { label: "Summarize", description: "Create a concise summary of the note." },
  explain: { label: "Explain", description: "Explain content in simpler language." },
  rewrite: { label: "Rewrite", description: "Improve flow and clarity while preserving meaning." },
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

const AiAuditPanel = ({ noteId, noteContent, editor }: AiAuditPanelProps) => {
  const [open, setOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<AiAction | null>(null);
  const [result, setResult] = useState<AssistResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectionRange, setSelectionRange] = useState<SelectionRange>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [streamedSuggestion, setStreamedSuggestion] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);

  const plainNoteText = useMemo(() => stripHtml(noteContent), [noteContent]);

  useEffect(() => {
    setCopied(false);
    const text = result?.suggestion ?? "";
    if (!text) {
      setStreamedSuggestion("");
      setIsStreaming(false);
      return;
    }

    setIsStreaming(true);
    setStreamedSuggestion("");

    const step = Math.max(2, Math.ceil(text.length / 120));
    let index = 0;

    const timer = window.setInterval(() => {
      index = Math.min(text.length, index + step);
      setStreamedSuggestion(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(timer);
        setIsStreaming(false);
      }
    }, 16);

    return () => window.clearInterval(timer);
  }, [result?.suggestion]);

  const runAction = async (action: AiAction) => {
    const { text: selectedText, range } = getSelection(editor);
    const sourceText = selectedText || plainNoteText;

    if (!sourceText) {
      setErrorMessage("No text found to process. Add content or select text first.");
      setDialogOpen(true);
      return;
    }

    try {
      setLoadingAction(action);
      const res = await api.post("/ai/assist", {
        noteId,
        action,
        selectedText: selectedText || undefined,
        noteText: sourceText,
      });

      setSelectionRange(range);
      setResult(res.data?.data ?? null);
      setErrorMessage(null);
      setDialogOpen(true);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || "AI action failed. Please try again.");
      setResult(null);
      setDialogOpen(true);
    } finally {
      setLoadingAction(null);
    }
  };

  const applySuggestionToSelection = () => {
    if (!editor || !result?.suggestion || !selectionRange) return;

    editor
      .chain()
      .focus()
      .insertContentAt(selectionRange, result.suggestion)
      .run();

    setDialogOpen(false);
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
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="absolute bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-[#0f1728]/90 text-zinc-100 shadow-[0_12px_28px_rgba(0,0,0,0.35)] transition duration-200 hover:scale-[1.02] hover:bg-[#17233a]"
        aria-label="Toggle AI assistant"
      >
        <motion.div
          key={open ? "close" : "spark"}
          initial={{ rotate: -20, opacity: 0, scale: 0.7 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 20, opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.16 }}
        >
          {open ? <X size={18} /> : <Sparkles size={18} />}
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-20 right-6 z-40 w-[320px] origin-bottom-right rounded-2xl border border-white/10 bg-[#0f1728]/95 p-4 shadow-2xl backdrop-blur-md"
          >
            <div className="mb-3 flex items-center gap-2 text-zinc-100">
              <Bot size={16} className="text-primary" />
              <h3 className="text-sm font-semibold">AI Assistant</h3>
            </div>

            <div className="space-y-2">
              {(Object.keys(actionMeta) as AiAction[]).map((action) => (
                <button
                  key={action}
                  onClick={() => runAction(action)}
                  disabled={loadingAction !== null}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:border-white/20 hover:bg-white/[0.08] disabled:opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-100">{actionMeta[action].label}</span>
                    {loadingAction === action ? <WandSparkles size={14} className="animate-pulse text-primary" /> : null}
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">{actionMeta[action].description}</p>
                </button>
              ))}
            </div>

            <p className="mt-3 text-[11px] text-zinc-500">
              Tip: select text first to get targeted suggestions and enable one-click replacement.
            </p>
          </motion.aside>
        )}
      </AnimatePresence>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl border-white/10 bg-[#101a2b] text-zinc-100">
          <DialogHeader>
            <DialogTitle>AI Suggestion</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {errorMessage
                ? "We could not complete that request."
                : result?.sourceType === "selection"
                  ? "Suggestion generated from your selected text."
                  : "Suggestion generated from the note content."}
            </DialogDescription>
          </DialogHeader>

          {errorMessage ? (
            <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{errorMessage}</div>
          ) : (
            <div className="relative max-h-[320px] overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-3 text-sm leading-relaxed text-zinc-100 whitespace-pre-wrap">
              {streamedSuggestion || "No suggestion returned."}
              {isStreaming ? <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-zinc-300 align-middle" /> : null}
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            <div className="text-xs text-zinc-400">
              {result?.action === "grammar" ? `Detected ${result.errors?.length ?? 0} potential grammar edits.` : ""}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copySuggestion} disabled={Boolean(errorMessage) || !result?.suggestion}>
                {copied ? <CheckCheck /> : <Copy />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Close
              </Button>
              <Button
                onClick={applySuggestionToSelection}
                disabled={Boolean(errorMessage) || !result?.suggestion || !selectionRange}
              >
                <Check />
                Replace Selected Text
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AiAuditPanel;
