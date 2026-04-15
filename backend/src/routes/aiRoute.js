import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  aiAssistController,
  chatWithAiController,
  checkGrammarController,
  getChatSessionController,
  getAllSessionsController,
} from "../controllers/ai.controller.js";

const router = express.Router();
router.use(authMiddleware);

router.post("/check-note/:noteId", checkGrammarController);
router.post("/assist", aiAssistController);
router.post("/chat", chatWithAiController);
router.get("/sessions", getAllSessionsController);
router.get("/chat/session/:sessionId", getChatSessionController);

export default router;
