import { useState, useCallback } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import type { ChatHistoryMessage } from "@/components/ai/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Flashcard {
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface QuizQuestion {
  type: "mcq" | "true_false" | "short_answer";
  question: string;
  options?: string[];   // MCQ only
  answer: string;
  explanation: string;
}

export interface QuizAttempt {
  score: number;
  total: number;
  completedAt: string;
}

export type QuizType = "mcq" | "true_false" | "short_answer";
export type ModelStyle = "deepseek" | "qwen" | "gemini";

// ─── Error helper ─────────────────────────────────────────────────────────────

const extractMessage = (err: unknown, fallback: string): string => {
  if (err && typeof err === "object" && "response" in err) {
    const resp = (err as any).response;
    return resp?.data?.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useStudy — owns all API calls, loading states, and local data for the Study Panel.
 *
 * @param noteId      - ID of the currently open note
 * @param chatHistory - Live chat history from useAiChat (for weak-spot detection)
 */
export const useStudy = (noteId: string, chatHistory: ChatHistoryMessage[]) => {

  // ── Flashcard state ──────────────────────────────────────────────────────
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [cardsFetched, setCardsFetched] = useState(false);

  // ── Quiz state ───────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizFetched, setQuizFetched] = useState(false);

  const isNew = noteId === "new" || !noteId;

  // ── Flashcard actions ────────────────────────────────────────────────────

  /**
   * Generates a fresh flashcard deck via DeepSeek.
   * Passes the last 6 user chat turns for weak-spot targeting.
   */
  const generateFlashcards = useCallback(async (
    count = 12,
    modelStyle: ModelStyle = "deepseek"
  ) => {
    if (isNew) return toast.error("Save your note first to unlock Iris's study tools!");
    setIsGeneratingCards(true);
    try {
      const res = await api.post(`/study/${noteId}/flashcards/generate`, {
        count,
        modelStyle,
        // Pass last 6 user turns — backend slices to 6 anyway, but being explicit
        chatHistory: chatHistory.filter(h => h.role === "user").slice(-6),
      });
      const newCards: Flashcard[] = res.data.data.cards;
      setCards(newCards);
      setCardsFetched(true);
      toast.success(`✨ ${newCards.length} flashcards generated!`);
    } catch (err) {
      toast.error(extractMessage(err, "Failed to generate flashcards. Try again."));
    } finally {
      setIsGeneratingCards(false);
    }
  }, [noteId, chatHistory, isNew]);

  /** Fetches the saved flashcard deck (if one exists). */
  const fetchFlashcards = useCallback(async () => {
    if (isNew || cardsFetched) return;
    try {
      const res = await api.get(`/study/${noteId}/flashcards`);
      setCards(res.data.data.cards ?? []);
      setCardsFetched(true);
    } catch (err: any) {
      // 404 just means none generated yet — not an error worth showing
      if (err?.response?.status !== 404) {
        toast.error(extractMessage(err, "Could not load flashcards."));
      }
      setCardsFetched(true);
    }
  }, [noteId, cardsFetched, isNew]);

  /** Deletes the flashcard deck for this note. */
  const deleteFlashcards = useCallback(async () => {
    if (isNew) return;
    try {
      await api.delete(`/study/${noteId}/flashcards`);
      setCards([]);
      setCardsFetched(false);
      toast.success("Flashcard deck deleted.");
    } catch (err) {
      toast.error(extractMessage(err, "Failed to delete flashcards."));
    }
  }, [noteId, isNew]);

  // ── Quiz actions ─────────────────────────────────────────────────────────

  /**
   * Generates a fresh quiz via DeepSeek.
   * Passes the last 6 user chat turns for weak-spot weighting.
   */
  const generateQuiz = useCallback(async (
    count = 10,
    types: QuizType[] = ["mcq", "true_false", "short_answer"],
    modelStyle: ModelStyle = "deepseek"
  ) => {
    if (isNew) return toast.error("Start typing to unlock quizzes and flashcards.");
    setIsGeneratingQuiz(true);
    try {
      const res = await api.post(`/study/${noteId}/quiz/generate`, {
        count,
        types,
        modelStyle,
        chatHistory: chatHistory.filter(h => h.role === "user").slice(-6),
      });
      const newQuestions: QuizQuestion[] = res.data.data.questions;
      setQuestions(newQuestions);
      setAttempts([]);
      setQuizFetched(true);
      toast.success(`✨ ${newQuestions.length} questions generated!`);
    } catch (err) {
      toast.error(extractMessage(err, "Failed to generate quiz. Try again."));
    } finally {
      setIsGeneratingQuiz(false);
    }
  }, [noteId, chatHistory, isNew]);

  /** Fetches the saved quiz + attempt history (if one exists). */
  const fetchQuiz = useCallback(async () => {
    if (isNew || quizFetched) return;
    try {
      const res = await api.get(`/study/${noteId}/quiz`);
      setQuestions(res.data.data.questions ?? []);
      setAttempts(res.data.data.attempts ?? []);
      setQuizFetched(true);
    } catch (err: any) {
      if (err?.response?.status !== 404) {
        toast.error(extractMessage(err, "Could not load quiz."));
      }
      setQuizFetched(true);
    }
  }, [noteId, quizFetched, isNew]);

  /** Records a completed quiz attempt. */
  const saveAttempt = useCallback(async (score: number, total: number) => {
    if (isNew) return;
    try {
      const res = await api.post(`/study/${noteId}/quiz/attempt`, { score, total });
      setAttempts(res.data.data.attempts ?? []);
    } catch {
      // Non-critical — don't interrupt the results screen
      console.warn("Failed to persist quiz attempt.");
    }
  }, [noteId, isNew]);

  /** Deletes the quiz for this note. */
  const deleteQuiz = useCallback(async () => {
    if (isNew) return;
    try {
      await api.delete(`/study/${noteId}/quiz`);
      setQuestions([]);
      setAttempts([]);
      setQuizFetched(false);
      toast.success("Quiz deleted.");
    } catch (err) {
      toast.error(extractMessage(err, "Failed to delete quiz."));
    }
  }, [noteId, isNew]);

  // ── Return ────────────────────────────────────────────────────────────────
  return {
    // Flashcards
    cards,
    isGeneratingCards,
    cardsFetched,
    generateFlashcards,
    fetchFlashcards,
    deleteFlashcards,

    // Quiz
    questions,
    attempts,
    isGeneratingQuiz,
    quizFetched,
    generateQuiz,
    fetchQuiz,
    saveAttempt,
    deleteQuiz,
  };
};
