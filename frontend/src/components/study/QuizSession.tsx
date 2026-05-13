import { useState } from "react";
import { Check, X, Loader2, RefreshCw, RotateCcw } from "lucide-react";
import type { QuizQuestion, QuizAttempt, QuizType } from "@/hooks/useStudy";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuizSessionProps {
  questions: QuizQuestion[];
  attempts: QuizAttempt[];
  isGenerating: boolean;
  onGenerate: (count: number, types: QuizType[]) => void;
  onSaveAttempt: (score: number, total: number) => void;
}

type Phase = "config" | "active" | "results";

const TYPE_LABELS: Record<QuizType, string> = {
  mcq: "Multiple choice",
  true_false: "True / False",
  short_answer: "Short answer",
};

const TYPE_ICONS: Record<QuizType, string> = {
  mcq: "🔤",
  true_false: "☑️",
  short_answer: "✍️",
};

const COUNT_OPTIONS = [5, 10, 15];
const ALL_TYPES: QuizType[] = ["mcq", "true_false", "short_answer"];

// ─── Helper ───────────────────────────────────────────────────────────────────

const scoreMessage = (pct: number) => {
  if (pct === 100) return "Perfect score! 🎉";
  if (pct >= 80)  return "Great job! 💪";
  if (pct >= 60)  return "Decent! Keep practicing 📚";
  return "Keep studying — you'll get there! 🔄";
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Question type badge */
const TypeBadge = ({ type }: { type: QuizQuestion["type"] }) => {
  const labels: Record<QuizQuestion["type"], string> = {
    mcq: "MCQ",
    true_false: "True / False",
    short_answer: "Short Answer",
  };
  return <span className="quiz-question-type-badge">{labels[type]}</span>;
};

// ── MCQ ───────────────────────────────────────────────────────────────────────

const McqQuestion = ({
  question,
  selected,
  revealed,
  onSelect,
}: {
  question: QuizQuestion;
  selected: string | null;
  revealed: boolean;
  onSelect: (opt: string) => void;
}) => (
  <div className="quiz-options">
    {(question.options ?? []).map((opt) => {
      const isSelected = selected === opt;
      const isCorrect  = opt === question.answer;
      let cls = "quiz-option";
      if (revealed) {
        if (isCorrect) cls += " quiz-option-correct";
        else if (isSelected && !isCorrect) cls += " quiz-option-wrong";
      } else if (isSelected) {
        cls += " quiz-option-selected";
      }
      return (
        <button
          key={opt}
          type="button"
          className={cls}
          onClick={() => !revealed && onSelect(opt)}
          disabled={revealed}
        >
          {revealed && isCorrect && <Check size={13} />}
          {revealed && isSelected && !isCorrect && <X size={13} />}
          {opt}
        </button>
      );
    })}
  </div>
);

// ── True / False ──────────────────────────────────────────────────────────────

const TrueFalseQuestion = ({
  question,
  selected,
  revealed,
  onSelect,
}: {
  question: QuizQuestion;
  selected: string | null;
  revealed: boolean;
  onSelect: (v: string) => void;
}) => (
  <div className="quiz-tf-row">
    {["True", "False"].map((val) => {
      const isSelected = selected === val;
      const isCorrect  = val === question.answer;
      let cls = "quiz-tf-btn";
      if (revealed) {
        if (isCorrect) cls += " quiz-option-correct";
        else if (isSelected && !isCorrect) cls += " quiz-option-wrong";
      } else if (isSelected) {
        cls += " quiz-tf-btn-selected";
      }
      return (
        <button
          key={val}
          type="button"
          className={cls}
          onClick={() => !revealed && onSelect(val)}
          disabled={revealed}
        >
          {val}
        </button>
      );
    })}
  </div>
);

// ── Short answer ──────────────────────────────────────────────────────────────

const ShortAnswerQuestion = ({
  value,
  revealed,
  onChange,
}: {
  value: string;
  revealed: boolean;
  onChange: (v: string) => void;
}) => (
  <textarea
    className="quiz-short-input"
    placeholder="Type your answer…"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={revealed}
  />
);

// ─── Main Component ───────────────────────────────────────────────────────────

const QuizSession = ({
  questions,
  attempts,
  isGenerating,
  onGenerate,
  onSaveAttempt,
}: QuizSessionProps) => {
  // ── Config state ─────────────────────────────────────────────────────────
  const [count, setCount]   = useState(10);
  const [types, setTypes]   = useState<QuizType[]>(["mcq", "true_false", "short_answer"]);

  // ── Session state ─────────────────────────────────────────────────────────
  const [phase, setPhase]        = useState<Phase>(questions.length > 0 ? "active" : "config");
  const [qIndex, setQIndex]      = useState(0);
  const [selected, setSelected]  = useState<string | null>(null);
  const [shortText, setShortText]= useState("");
  const [revealed, setRevealed]  = useState(false);
  const [score, setScore]        = useState(0);

  const q = questions[qIndex];
  const progressPct = questions.length > 0 ? ((qIndex) / questions.length) * 100 : 0;

  const toggleType = (t: QuizType) =>
    setTypes((prev) =>
      prev.includes(t)
        ? prev.length > 1 ? prev.filter((x) => x !== t) : prev // keep at least one
        : [...prev, t]
    );

  const startQuiz = async () => {
    await onGenerate(count, types);
    setQIndex(0);
    setSelected(null);
    setShortText("");
    setRevealed(false);
    setScore(0);
    setPhase("active");
  };

  const reveal = () => {
    setRevealed(true);
    // Scoring happens in next() — not here — to avoid double-counting
  };

  const next = () => {
    // Compute score for this question synchronously (setScore is async)
    const gained =
      q.type === "short_answer"
        ? 1 // self-assessed: always award when they move on
        : selected === q.answer
          ? 1
          : 0;
    const newScore = score + gained;
    setScore(newScore);

    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
      setSelected(null);
      setShortText("");
      setRevealed(false);
    } else {
      onSaveAttempt(newScore, questions.length);
      setPhase("results");
    }
  };

  const restart = () => {
    setQIndex(0);
    setSelected(null);
    setShortText("");
    setRevealed(false);
    setScore(0);
    setPhase("active");
  };

  const backToConfig = () => {
    setPhase("config");
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isGenerating) {
    return (
      <div className="study-empty">
        <Loader2 size={28} className="animate-spin text-[var(--study-accent)] mb-1" />
        <p className="study-empty-title">Generating quiz…</p>
        <p className="study-empty-desc">DeepSeek is crafting questions from your note.</p>
        <div className="study-skeleton w-full mt-2" style={{ height: "8rem" }} />
        <div className="study-skeleton w-full" style={{ height: "2.4rem" }} />
        <div className="study-skeleton w-full" style={{ height: "2.4rem" }} />
      </div>
    );
  }

  // ── Config screen ─────────────────────────────────────────────────────────
  if (phase === "config") {
    return (
      <div className="quiz-config">
        {/* Last attempt summary */}
        {attempts.length > 0 && (() => {
          const last = attempts[attempts.length - 1];
          const pct = Math.round((last.score / last.total) * 100);
          return (
            <div className="quiz-explanation">
              <div className="quiz-explanation-label">Last attempt</div>
              {last.score}/{last.total} ({pct}%)
            </div>
          );
        })()}

        {/* Question count */}
        <div className="quiz-config-section">
          <p className="quiz-config-label">Questions</p>
          <div className="quiz-count-pills">
            {COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                className={`quiz-count-pill${count === n ? " quiz-count-pill-active" : ""}`}
                onClick={() => setCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Question types */}
        <div className="quiz-config-section">
          <p className="quiz-config-label">Question types</p>
          <div className="quiz-type-toggles">
            {ALL_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`quiz-type-toggle${types.includes(t) ? " quiz-type-toggle-active" : ""}`}
                onClick={() => toggleType(t)}
              >
                <span>{TYPE_ICONS[t]}</span>
                {TYPE_LABELS[t]}
                {types.includes(t) && <Check size={13} className="ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="study-generate-btn"
          onClick={startQuiz}
          disabled={types.length === 0}
        >
          {questions.length > 0 ? "Regenerate & Start" : "Generate & Start Quiz"}
        </button>

        {questions.length > 0 && (
          <button
            type="button"
            className="study-generate-btn"
            style={{ background: "var(--surface-muted)", color: "var(--muted-text)" }}
            onClick={() => setPhase("active")}
          >
            Resume Quiz
          </button>
        )}
      </div>
    );
  }

  // ── Results screen ────────────────────────────────────────────────────────
  if (phase === "results") {
    const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    return (
      <div className="quiz-results">
        {/* Score ring */}
        <div className="relative w-24 h-24 flex items-center justify-center mb-2">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="var(--surface-muted)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="var(--study-accent)"
              strokeWidth="8"
              fill="none"
              strokeDasharray="276.46"
              strokeDashoffset={276.46 - (276.46 * pct) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="z-10">
            <div className="quiz-score-value">{pct}%</div>
          </div>
        </div>
        <p className="quiz-score-label">{score} / {questions.length} correct</p>
        <p className="quiz-results-title">{scoreMessage(pct)}</p>
        <p className="quiz-results-desc">
          Your score has been saved. Challenge yourself again to track improvement.
        </p>

        <div className="flex flex-col gap-2 w-full mt-1">
          <button
            type="button"
            className="study-generate-btn"
            onClick={restart}
          >
            <RotateCcw size={13} />
            Retry same quiz
          </button>
          <button
            type="button"
            className="study-generate-btn"
            style={{ background: "var(--surface-muted)", color: "var(--muted-text)" }}
            onClick={backToConfig}
          >
            <RefreshCw size={13} />
            New quiz
          </button>
        </div>
      </div>
    );
  }

  // ── Active quiz ───────────────────────────────────────────────────────────
  if (!q) return null;

  const canReveal = q.type === "mcq"
    ? selected !== null
    : q.type === "true_false"
      ? selected !== null
      : shortText.trim().length > 0;

  return (
    <>
      {/* Progress bar */}
      <div className="quiz-progress-bar">
        <div className="quiz-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Counter */}
      <p className="flashcard-counter">{qIndex + 1} / {questions.length}</p>

      {/* Question card */}
      <div className="quiz-question-card">
        <TypeBadge type={q.type} />
        <p className="quiz-question-text">{q.question}</p>

        {q.type === "mcq" && (
          <McqQuestion
            question={q}
            selected={selected}
            revealed={revealed}
            onSelect={setSelected}
          />
        )}
        {q.type === "true_false" && (
          <TrueFalseQuestion
            question={q}
            selected={selected}
            revealed={revealed}
            onSelect={setSelected}
          />
        )}
        {q.type === "short_answer" && (
          <ShortAnswerQuestion
            value={shortText}
            revealed={revealed}
            onChange={setShortText}
          />
        )}

        {/* Explanation */}
        {revealed && (
          <div className="quiz-explanation">
            <div className="quiz-explanation-label">Explanation</div>
            {q.type === "short_answer" && (
              <p className="text-[0.78rem] text-[var(--study-accent)] mb-1">
                Model answer: <strong>{q.answer}</strong>
              </p>
            )}
            {q.explanation}
          </div>
        )}
      </div>

      {/* Action button */}
      {!revealed ? (
        <button
          type="button"
          className="study-generate-btn"
          onClick={reveal}
          disabled={!canReveal}
        >
          Check Answer
        </button>
      ) : (
        <button
          type="button"
          className="study-generate-btn"
          onClick={next}
        >
          {qIndex < questions.length - 1 ? "Next Question →" : "See Results"}
        </button>
      )}

      {/* Back to config */}
      <button
        type="button"
        className="text-[0.75rem] text-[var(--muted-text)] hover:text-[var(--text-strong)] transition-colors text-center"
        onClick={backToConfig}
      >
        ← Back to settings
      </button>
    </>
  );
};

export default QuizSession;
