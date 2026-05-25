import { useState, useEffect, useRef, useCallback } from "react";
import { X, CornerDownLeft } from "lucide-react";
import type { AskSegment } from "@/components/ai/types";

interface IrisAskBlockProps {
  segment: AskSegment;
  onAnswer: (answer: string) => void;
  answered?: boolean;
  /** The answer already given (controlled from parent for sequential display) */
  chosenAnswer?: string | null;
}

const IrisAskBlock = ({ segment, onAnswer, answered = false, chosenAnswer: controlledChosen = null }: IrisAskBlockProps) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [customInput, setCustomInput]  = useState("");
  const [localChosen, setLocalChosen]  = useState<string | null>(null);
  const [dismissed, setDismissed]      = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Prefer the controlled answer from parent (sequential display)
  const chosen    = controlledChosen ?? localChosen;
  const isAnswered = answered || chosen !== null || dismissed;

  const pickOption = useCallback((opt: string) => {
    if (isAnswered) return;
    setLocalChosen(opt);
    onAnswer(opt);
  }, [isAnswered, onAnswer]);

  const skipDialog = useCallback(() => {
    if (isAnswered) return;
    setDismissed(true);
  }, [isAnswered]);

  const submitCustom = useCallback(() => {
    const trimmed = customInput.trim();
    if (!trimmed || isAnswered) return;
    setLocalChosen(trimmed);
    onAnswer(trimmed);
  }, [customInput, isAnswered, onAnswer]);


  // ── Keyboard navigation (↑↓ + Enter) ──────────────────────────────────────
  useEffect(() => {
    if (isAnswered) return;
    const len = (segment.options || []).length; // 0 when no options

    const onKey = (e: KeyboardEvent) => {
      const target = e.target;
      if (target instanceof HTMLElement) {
        const isTyping = Boolean(target.closest("input, textarea, [contenteditable='true'], .ProseMirror"));
        const isSelfInput = inputRef.current && target === inputRef.current;
        if (isTyping && !isSelfInput) {
          return;
        }
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % (len + 1)); // +1 for input row
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i <= 0 ? len : i - 1));
      } else if (e.key === "Enter") {
        if (activeIndex >= 0 && activeIndex < len) {
          e.preventDefault();
          pickOption(segment.options[activeIndex]);
        }
        // Enter on input row is handled by the input's own onKeyDown
      } else if (e.key === "Escape") {
        skipDialog();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAnswered, activeIndex, segment.options, pickOption, skipDialog]);

  // ── Collapsed answered state ──────────────────────────────────────────────
  if (isAnswered && !dismissed) {
    return (
      <div className="iris-ask-replied-bar">
        <span className="iris-ask-replied-label">You chose:</span>
        <span className="iris-ask-replied-value">{chosen}</span>
      </div>
    );
  }

  if (dismissed) return null;

  return (
    <div className="iris-ask-dialog" role="dialog" aria-label="Clarification request">
      {/* Header */}
      <div className="iris-ask-dialog-header">
        <p className="iris-ask-dialog-question">{segment.question}</p>
        <button
          type="button"
          className="iris-ask-dialog-close"
          onClick={skipDialog}
          aria-label="Skip"
        >
          <X size={13} />
        </button>
      </div>

      {/* Numbered option rows */}
      {(segment.options || []).length > 0 && (
        <div className="iris-ask-dialog-options">
          {(segment.options || []).map((opt, i) => (
            <button
              key={opt}
              type="button"
              className={`iris-ask-dialog-row${activeIndex === i ? " iris-ask-dialog-row-active" : ""}`}
              onClick={() => pickOption(opt)}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(-1)}
            >
              <span className="iris-ask-dialog-num">{i + 1}</span>
              <span className="iris-ask-dialog-opt-text">{opt}</span>
              {activeIndex === i && <CornerDownLeft size={12} className="iris-ask-enter-icon" />}
            </button>
          ))}
        </div>
      )}

      {/* "Something else" / free-text row */}
      <div
        className={`iris-ask-dialog-input-row${activeIndex === (segment.options || []).length ? " iris-ask-dialog-row-active" : ""}`}
        onMouseEnter={() => setActiveIndex((segment.options || []).length)}
        onMouseLeave={() => setActiveIndex(-1)}
      >
        <input
          ref={inputRef}
          type="text"
          className="iris-ask-dialog-input"
          placeholder={(segment.options || []).length > 0 ? "Something else…" : "Type your answer…"}
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitCustom()}
        />
        <button
          type="button"
          className="iris-ask-dialog-skip"
          onClick={skipDialog}
        >
          Skip
        </button>
      </div>

      {/* Keyboard hint */}
      {(segment.options || []).length > 0 && (
        <p className="iris-ask-dialog-hint">
          ↑↓ to navigate · Enter to select · or type below
        </p>
      )}
    </div>
  );
};

export default IrisAskBlock;
