import { ArrowUp, Square, Type, FileText, Wand2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AiAction, SelectionRange } from "@/components/ai/types";

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
    label: "Explain",
    prompt: "Explain this note in simpler language with clear takeaways.",
  },
  rewrite: {
    label: "Rewrite",
    prompt: "Rewrite this note for clarity and better flow while keeping meaning intact.",
  },
};

type AiComposeProps = {
  /** Current text in the chat input */
  chatInput: string;
  /** Whether text is currently selected in the editor */
  selectionRange: SelectionRange;
  /** Which quick action is loading (null = none) */
  loadingAction: AiAction | null;
  /** True while a chat send is in progress */
  isSending: boolean;
  mobileMode?: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  onAction: (action: AiAction) => void;
};

/**
 * The bottom compose area of the AI panel.
 *
 * Contains:
 * - Context indicator bar (tells the user if AI will use their selection or the full note)
 * - Quick actions dropdown (Improve, Summarize, Brainstorm, Rewrite)
 * - Chat textarea (Enter = send, Shift+Enter = newline)
 * - Send / Stop button footer
 *
 * This component is purely presentational — no API calls, no message state.
 * It fires callbacks up to the parent for everything.
 */
const AiCompose = ({
  chatInput,
  selectionRange,
  loadingAction,
  isSending,
  mobileMode = false,
  onInputChange,
  onSend,
  onStop,
  onAction,
}: AiComposeProps) => {
  const isBusy = isSending || loadingAction !== null;

  return (
    <div className="assistant-compose">
      <div className="assistant-compose-shell bg-[#1c1b1b]">
        {/* Context indicator + Quick actions row */}
        <div className="px-2 py-1 mb-2 border-b border-[var(--divider)] rounded-md flex items-center justify-between gap-2 text-xs font-medium text-[var(--muted-text)] bg-[var(--surface-muted)]">
          {/* Left side: which context the AI will use */}
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

          {/* Right side: quick actions dropdown */}
          {mobileMode ? (
            <div className="assistant-mobile-actions">
              {(Object.keys(actionMeta) as AiAction[]).map((action) => (
                <button
                  key={action}
                  type="button"
                  disabled={isBusy}
                  onClick={() => onAction(action)}
                  className={`assistant-mobile-action ${loadingAction === action ? "assistant-mobile-action-active" : ""}`}
                  title={actionMeta[action].prompt}
                >
                  {actionMeta[action].label}
                </button>
              ))}
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={isBusy}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[var(--surface-ghost)] text-[var(--text-strong)] transition-colors disabled:opacity-50"
                  title="Quick Actions"
                >
                  <Wand2
                    size={12}
                    className={
                      loadingAction
                        ? "animate-pulse text-[var(--accent-strong)]"
                        : "text-[var(--accent-strong)]"
                    }
                  />
                  {loadingAction ? actionMeta[loadingAction].label : "Actions"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-zinc-950 border-zinc-800 text-zinc-100 shadow-md"
              >
                {(Object.keys(actionMeta) as AiAction[]).map((action) => (
                  <DropdownMenuItem
                    key={action}
                    onClick={() => onAction(action)}
                    className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 focus:text-zinc-100 text-sm py-1.5 transition-colors"
                    title={actionMeta[action].prompt}
                  >
                    {actionMeta[action].label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Chat textarea */}
        <textarea
          className="assistant-compose-input custom-scrollbar"
          value={chatInput}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Ask about this note, get ideas, or request edits..."
          rows={2}
          disabled={isSending}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />

        {/* Send / Stop footer */}
        <div className="assistant-compose-footer">
          {isBusy ? (
            <button
              type="button"
              className="assistant-send-button bg-[var(--surface-ghost)] hover:bg-[var(--surface-hover)] text-[var(--text-strong)] border-[var(--divider)]"
              onClick={onStop}
              title="Stop AI Request"
            >
              <Square size={13} fill="currentColor" />
            </button>
          ) : (
            <button
              type="button"
              className="assistant-send-button"
              onClick={onSend}
              disabled={!chatInput.trim()}
            >
              <ArrowUp size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export { actionMeta };
export default AiCompose;
