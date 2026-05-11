import catchAsync from "../utils/catchAsync.js";
import Notes from "../models/notes.model.js";
import FlashCard from "../models/flashCard.model.js";
import Quiz from "../models/quiz.model.js";
import { stripHtml } from "../utils/stripHtml.js";
import {
  generateFlashcardsFromNote,
  generateQuizFromNote,
} from "../services/study.service.js";


// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Fetch a note and verify it belongs to the requesting user.
 * Returns null (with 404 sent) if not found or unauthorised.
 */
const resolveNote = async (noteId, userId, res) => {
  const note = await Notes.findOne({ _id: noteId, user: userId }).lean();
  if (!note) {
    res.status(404).json({ success: false, message: "Note not found" });
    return null;
  }
  if (!note.content || stripHtml(note.content).trim().length < 100) {
    res.status(400).json({
      success: false,
      message: "Note is too short to generate study material (minimum 100 characters)",
    });
    return null;
  }
  return note;
};

/**
 * Extract the last 6 user chat turns from a note's chatHistory.
 * Used to let DeepSeek identify weak spots before generating questions.
 */
const extractWeakSpotHistory = (chatHistory = []) =>
  chatHistory
    .filter((h) => h.role === "user")
    .slice(-6);

// ─── FLASHCARD CONTROLLERS ────────────────────────────────────────────────────

/**
 * POST /api/study/:noteId/flashcards/generate
 * Generates a fresh flashcard deck from the note via DeepSeek.
 * Body: { count?: number, modelStyle?: "deepseek"|"qwen"|"gemini" }
 */
export const generateFlashcards = catchAsync(async (req, res) => {
  const { noteId } = req.params;
  const { count = 12, modelStyle = "deepseek" } = req.body;

  const note = await resolveNote(noteId, req.user._id, res);
  if (!note) return;

  const noteContent = stripHtml(note.content);
  const chatHistory = extractWeakSpotHistory(note.chatHistory);

  console.log(
    `📚 Generating ${count} flashcards for note ${noteId} (style: ${modelStyle}, weak-spot turns: ${chatHistory.length})`
  );

  const cards = await generateFlashcardsFromNote(noteContent, {
    count,
    chatHistory,
    modelStyle,
  });

  // Upsert — replace the existing deck for this note
  const deck = await FlashCard.findOneAndUpdate(
    { note: noteId, user: req.user._id },
    { cards, generatedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({
    success: true,
    data: {
      deckId: deck._id,
      cards: deck.cards,
      generatedAt: deck.generatedAt,
      weakSpotsUsed: chatHistory.length > 0,
    },
  });
});

/**
 * GET /api/study/:noteId/flashcards
 * Fetches the saved flashcard deck for a note.
 */
export const getFlashcards = catchAsync(async (req, res) => {
  const { noteId } = req.params;

  // Verify note ownership without content check (read-only)
  const noteExists = await Notes.exists({ _id: noteId, user: req.user._id });
  if (!noteExists) {
    return res.status(404).json({ success: false, message: "Note not found" });
  }

  const deck = await FlashCard.findOne({ note: noteId, user: req.user._id }).lean();
  if (!deck) {
    return res.status(404).json({
      success: false,
      message: "No flashcards found for this note. Generate some first!",
    });
  }

  res.status(200).json({
    success: true,
    data: {
      deckId: deck._id,
      cards: deck.cards,
      generatedAt: deck.generatedAt,
    },
  });
});

/**
 * DELETE /api/study/:noteId/flashcards
 * Deletes the flashcard deck for a note.
 */
export const deleteFlashcards = catchAsync(async (req, res) => {
  const { noteId } = req.params;

  const deleted = await FlashCard.findOneAndDelete({
    note: noteId,
    user: req.user._id,
  });

  if (!deleted) {
    return res.status(404).json({ success: false, message: "No flashcard deck found" });
  }

  res.status(200).json({ success: true, message: "Flashcard deck deleted" });
});

// ─── QUIZ CONTROLLERS ─────────────────────────────────────────────────────────

/**
 * POST /api/study/:noteId/quiz/generate
 * Generates a fresh quiz from the note via DeepSeek.
 * Body: { count?: number, types?: string[], modelStyle?: string }
 */
export const generateQuiz = catchAsync(async (req, res) => {
  const { noteId } = req.params;
  const {
    count = 10,
    types = ["mcq", "true_false", "short_answer"],
    modelStyle = "deepseek",
  } = req.body;

  const note = await resolveNote(noteId, req.user._id, res);
  if (!note) return;

  const noteContent = stripHtml(note.content);
  const chatHistory = extractWeakSpotHistory(note.chatHistory);

  console.log(
    `🧪 Generating ${count} quiz questions for note ${noteId} (types: ${types.join(", ")}, style: ${modelStyle}, weak-spot turns: ${chatHistory.length})`
  );

  const questions = await generateQuizFromNote(noteContent, {
    count,
    types,
    chatHistory,
    modelStyle,
  });

  // Upsert — replace existing quiz, preserve attempt history
  const quiz = await Quiz.findOneAndUpdate(
    { note: noteId, user: req.user._id },
    { questions, generatedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({
    success: true,
    data: {
      quizId: quiz._id,
      questions: quiz.questions,
      generatedAt: quiz.generatedAt,
      weakSpotsUsed: chatHistory.length > 0,
    },
  });
});

/**
 * GET /api/study/:noteId/quiz
 * Fetches the saved quiz for a note.
 */
export const getQuiz = catchAsync(async (req, res) => {
  const { noteId } = req.params;

  const noteExists = await Notes.exists({ _id: noteId, user: req.user._id });
  if (!noteExists) {
    return res.status(404).json({ success: false, message: "Note not found" });
  }

  const quiz = await Quiz.findOne({ note: noteId, user: req.user._id }).lean();
  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "No quiz found for this note. Generate one first!",
    });
  }

  res.status(200).json({
    success: true,
    data: {
      quizId: quiz._id,
      questions: quiz.questions,
      attempts: quiz.attempts,
      generatedAt: quiz.generatedAt,
    },
  });
});

/**
 * POST /api/study/:noteId/quiz/attempt
 * Records a completed quiz attempt (score + total).
 * Body: { score: number, total: number }
 */
export const saveQuizAttempt = catchAsync(async (req, res) => {
  const { noteId } = req.params;
  const { score, total } = req.body;

  if (score === undefined || total === undefined) {
    return res.status(400).json({
      success: false,
      message: "score and total are required",
    });
  }

  const quiz = await Quiz.findOneAndUpdate(
    { note: noteId, user: req.user._id },
    {
      $push: {
        attempts: { score, total, completedAt: new Date() },
      },
    },
    { new: true }
  );

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "No quiz found for this note",
    });
  }

  res.status(200).json({
    success: true,
    data: {
      attempts: quiz.attempts,
      latestScore: { score, total, percentage: Math.round((score / total) * 100) },
    },
  });
});

/**
 * DELETE /api/study/:noteId/quiz
 * Deletes the quiz (questions + attempt history) for a note.
 */
export const deleteQuiz = catchAsync(async (req, res) => {
  const { noteId } = req.params;

  const deleted = await Quiz.findOneAndDelete({
    note: noteId,
    user: req.user._id,
  });

  if (!deleted) {
    return res.status(404).json({ success: false, message: "No quiz found" });
  }

  res.status(200).json({ success: true, message: "Quiz deleted" });
});
