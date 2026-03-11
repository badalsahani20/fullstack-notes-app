import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { aiAssistController, checkGrammarController } from "../controllers/ai.controller.js";

const router = express.Router();
router.use(authMiddleware);

router.post("/check-note/:noteId", checkGrammarController);
router.post("/assist", aiAssistController);

export default router;
