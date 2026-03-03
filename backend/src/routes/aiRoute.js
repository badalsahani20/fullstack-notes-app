import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {checkGrammarController} from "../controllers/ai.controller.js"

const router = express.Router();
router.use(authMiddleware);

router.post("/check-note/:noteId", checkGrammarController);

export default router;