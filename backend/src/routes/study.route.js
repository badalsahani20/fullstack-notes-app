import { Router } from "express";
import {
  generateFlashcards,
  getFlashcards,
  deleteFlashcards,
  generateQuiz,
  getQuiz,
  saveQuizAttempt,
  deleteQuiz,
} from "../controllers/study.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import verifiedMiddleware from "../middleware/verified.middleware.js";

const router = Router();

router.use(authMiddleware);
router.use(verifiedMiddleware);

// Flashcards
router.post("/:noteId/flashcards/generate", generateFlashcards);
router.get("/:noteId/flashcards",           getFlashcards);
router.delete("/:noteId/flashcards",        deleteFlashcards);

// Quiz
router.post("/:noteId/quiz/generate",  generateQuiz);
router.get("/:noteId/quiz",            getQuiz);
router.post("/:noteId/quiz/attempt",   saveQuizAttempt);
router.delete("/:noteId/quiz",         deleteQuiz);

export default router;