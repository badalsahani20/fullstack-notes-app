import { useEffect, useState } from "react";
import { X, BookOpen, ClipboardList } from "lucide-react";
import { useStudy } from "@/hooks/study/useStudy";
import FlashcardDeck from "./FlashcardDeck";
import QuizSession from "./QuizSession";
import type { ChatHistoryMessage } from "@/components/ai/types";
import type { QuizType } from "@/hooks/study/useStudy";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudyPanelProps {
  noteId: string;
  chatHistory: ChatHistoryMessage[];
  onClose: () => void;
}

type Tab = "flashcards" | "quiz";

// ─── Component ────────────────────────────────────────────────────────────────

const StudyPanel = ({ noteId, chatHistory, onClose }: StudyPanelProps) => {
  const [tab, setTab] = useState<Tab>("flashcards");

  const {
    cards,
    isGeneratingCards,
    cardsFetched,
    generateFlashcards,
    fetchFlashcards,
    questions,
    attempts,
    isGeneratingQuiz,
    quizFetched,
    generateQuiz,
    fetchQuiz,
    saveAttempt,
  } = useStudy(noteId, chatHistory);

  // Fetch saved data on mount once per tab
  useEffect(() => {
    if (tab === "flashcards" && !cardsFetched) {
      void fetchFlashcards();
    }
    if (tab === "quiz" && !quizFetched) {
      void fetchQuiz();
    }
  }, [tab, cardsFetched, quizFetched, fetchFlashcards, fetchQuiz]);

  const handleGenerateQuiz = async (count: number, types: QuizType[]) => {
    await generateQuiz(count, types);
  };

  return (
    <aside className="study-panel">
      {/* Header */}
      <div className="study-panel-header">
        <div className="study-panel-title">
          📚 Study Mode
        </div>
        <button
          type="button"
          className="study-panel-close"
          onClick={onClose}
          aria-label="Close study panel"
        >
          <X size={15} />
        </button>
      </div>

      {/* Tabs */}
      <div className="study-tabs">
        <button
          type="button"
          className={`study-tab${tab === "flashcards" ? " study-tab-active" : ""}`}
          onClick={() => setTab("flashcards")}
          id="study-tab-flashcards"
        >
          <BookOpen size={13} />
          Flashcards
        </button>
        <button
          type="button"
          className={`study-tab${tab === "quiz" ? " study-tab-active" : ""}`}
          onClick={() => setTab("quiz")}
          id="study-tab-quiz"
        >
          <ClipboardList size={13} />
          Quiz
        </button>
      </div>

      {/* Body */}
      <div className="study-panel-body custom-scrollbar">
        {tab === "flashcards" && (
          <FlashcardDeck
            cards={cards}
            isGenerating={isGeneratingCards}
            onGenerate={() => void generateFlashcards()}
            onRegenerate={() => void generateFlashcards()}
          />
        )}

        {tab === "quiz" && (
          <QuizSession
            questions={questions}
            attempts={attempts}
            isGenerating={isGeneratingQuiz}
            onGenerate={handleGenerateQuiz}
            onSaveAttempt={(score, total) => void saveAttempt(score, total)}
          />
        )}
      </div>
    </aside>
  );
};

export default StudyPanel;
