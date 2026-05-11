import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, RefreshCw, Loader2 } from "lucide-react";
import type { Flashcard } from "@/hooks/useStudy";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlashcardDeckProps {
  cards: Flashcard[];
  isGenerating: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
}

// ─── Difficulty badge ─────────────────────────────────────────────────────────

const DifficultyBadge = ({ difficulty }: { difficulty: Flashcard["difficulty"] }) => (
  <span className={`flashcard-difficulty flashcard-difficulty-${difficulty}`}>
    {difficulty}
  </span>
);

// ─── Component ────────────────────────────────────────────────────────────────

const FlashcardDeck = ({ cards, isGenerating, onGenerate, onRegenerate }: FlashcardDeckProps) => {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());

  const card = cards[index];
  const knownCount = known.size;
  const progress = cards.length > 0 ? (knownCount / cards.length) * 100 : 0;

  const goTo = (next: number) => {
    setIndex(next);
    setIsFlipped(false);
  };

  const toggleKnown = () => {
    setKnown((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const reset = () => {
    setIndex(0);
    setIsFlipped(false);
    setKnown(new Set());
  };

  // ── Empty / loading state ─────────────────────────────────────────────────
  if (isGenerating) {
    return (
      <div className="study-empty">
        <Loader2 size={28} className="animate-spin text-[var(--study-accent)] mb-1" />
        <p className="study-empty-title">Generating flashcards…</p>
        <p className="study-empty-desc">Iris is reading your note and building your deck.</p>
        <div className="study-skeleton w-full mt-2" style={{ height: "9rem" }} />
        <div className="study-skeleton w-full" style={{ height: "2rem" }} />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="study-empty">
        <div className="study-empty-icon">🃏</div>
        <p className="study-empty-title">No flashcards yet</p>
        <p className="study-empty-desc">
          Generate a deck from this note. Your chat history will be used to target weak spots.
        </p>
        <button
          type="button"
          className="study-generate-btn mt-2"
          onClick={onGenerate}
        >
          Generate Flashcards
        </button>
      </div>
    );
  }

  // ── Active deck ───────────────────────────────────────────────────────────
  return (
    <>
      {/* Progress bar */}
      <div className="flashcard-progress">
        <div
          className="flashcard-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Counter */}
      <p className="flashcard-counter mb-1">
        {index + 1} / {cards.length}
        {knownCount > 0 && (
          <span className="ml-2 text-[var(--study-correct)]">· {knownCount} known</span>
        )}
      </p>

      {/* Flip card */}
      <div
        key={index}
        className="flashcard-scene animate-in fade-in zoom-in-95 duration-200"
        onClick={() => setIsFlipped((f) => !f)}
        role="button"
        aria-label={isFlipped ? "Show question" : "Reveal answer"}
        tabIndex={0}
        onKeyDown={(e) => e.key === " " || e.key === "Enter" ? setIsFlipped((f) => !f) : undefined}
      >
        <div className={`flashcard-inner${isFlipped ? " flipped" : ""}`}>
          {/* Front — question */}
          <div className="flashcard-face">
            <span className="flashcard-label">Question</span>
            <div className="flashcard-text-wrap custom-scrollbar">
              <p className="flashcard-text">{card.front}</p>
            </div>
            <p className="flashcard-hint mt-auto pt-2">Click to reveal answer</p>
            <DifficultyBadge difficulty={card.difficulty} />
          </div>

          {/* Back — answer */}
          <div className="flashcard-face flashcard-face-back">
            <span className="flashcard-label">Answer</span>
            <div className="flashcard-text-wrap custom-scrollbar">
              <p className="flashcard-text">{card.back}</p>
            </div>
            <DifficultyBadge difficulty={card.difficulty} />
          </div>
        </div>
      </div>

      {/* Navigation row */}
      <div className="flashcard-nav mt-1">
        <button
          type="button"
          className="flashcard-nav-btn"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          aria-label="Previous card"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          type="button"
          className={`flashcard-known-btn${known.has(index) ? " flashcard-known-btn-active" : ""}`}
          onClick={toggleKnown}
        >
          <Check size={13} />
          {known.has(index) ? "Known" : "Mark known"}
        </button>

        <button
          type="button"
          className="flashcard-nav-btn"
          onClick={() => goTo(index + 1)}
          disabled={index === cards.length - 1}
          aria-label="Next card"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Completion message */}
      {index === cards.length - 1 && (
        <div className="text-center text-[0.8rem] text-[var(--muted-text)] mt-1">
          🎉 End of deck —{" "}
          <button
            type="button"
            className="text-[var(--study-accent)] font-semibold hover:underline"
            onClick={reset}
          >
            restart
          </button>
          {" "}or{" "}
          <button
            type="button"
            className="text-[var(--study-accent)] font-semibold hover:underline"
            onClick={onRegenerate}
          >
            regenerate
          </button>
        </div>
      )}

      {/* Regenerate button */}
      <button
        type="button"
        className="study-generate-btn mt-auto"
        style={{ background: "var(--surface-muted)", color: "var(--muted-text)", marginTop: "0.25rem" }}
        onClick={onRegenerate}
      >
        <RefreshCw size={13} />
        Regenerate Deck
      </button>
    </>
  );
};

export default FlashcardDeck;
