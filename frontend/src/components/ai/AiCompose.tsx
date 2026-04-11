import { ArrowUp, Square, Type, FileText, Wand2, ImageIcon, X } from "lucide-react";
import { useRef } from "react";
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
  continue: {
    label: "Continue Writing",
    prompt: "Continue the content in a consistent tone and style.",
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
  attachedImage: string | null;
  setAttachedImage: (img: string | null) => void;
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
  attachedImage,
  setAttachedImage,
  onInputChange,
  onSend,
  onStop,
  onAction,
}: AiComposeProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isBusy = isSending || loadingAction !== null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // reset input so the same file can be selected again if removed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="assistant-compose">
      <div className="assistant-compose-shell">
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
          <div className="flex items-center gap-2">
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
                  className="assistant-actions-menu w-48 shadow-md"
                >
                  {(Object.keys(actionMeta) as AiAction[]).map((action) => (
                    <DropdownMenuItem
                      key={action}
                      onClick={() => onAction(action)}
                      className="assistant-actions-menu-item cursor-pointer text-sm py-1.5 transition-colors"
                      title={actionMeta[action].prompt}
                    >
                      {actionMeta[action].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Image Attach Button */}
            <button
              type="button"
              disabled={isBusy}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[var(--surface-ghost)] text-[var(--text-strong)] transition-colors disabled:opacity-50"
              title="Attach Image"
            >
              <ImageIcon size={12} className="text-[var(--accent-strong)]" />
              <span className="hidden sm:inline">Image</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden" 
            />
          </div>
        </div>

        {/* Attached Image Preview */}
        {attachedImage && (
          <div className="px-2 pb-2">
            <div className="relative inline-block border border-[var(--divider)] rounded-md overflow-hidden bg-[var(--surface-ghost)] group">
              <img src={attachedImage} alt="Attachment" className="max-h-20 w-auto opacity-90 group-hover:opacity-100 transition-opacity" />
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black transition-colors"
                title="Remove Image"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

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
              disabled={(!chatInput.trim() && !attachedImage)}
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
