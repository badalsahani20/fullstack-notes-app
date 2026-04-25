import express from "express";
import rateLimit from "express-rate-limit";
import { getSharedNote } from "../controllers/notes.controller.js";
import { getDynamicPromptsController } from "../controllers/ai.controller.js";

const router = express.Router();

// TODO: replace with Arcjet when integrating full rate limiting
const publicLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30,                 // 30 requests per IP per 5-minute window (increased for prompts)
  standardHeaders: true,   // Return rate limit info in headers
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please wait a few minutes before trying again." },
});

router.get("/notes/:slug", publicLimiter, getSharedNote);
router.get("/prompts", publicLimiter, getDynamicPromptsController);

export default router;