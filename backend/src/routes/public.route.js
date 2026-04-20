import express from "express";
import rateLimit from "express-rate-limit";
import { getSharedNote } from "../controllers/notes.controller.js";

const router = express.Router();

// TODO: replace with Arcjet when integrating full rate limiting
const publicNoteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30,                   // 30 requests per IP per window
  standardHeaders: true,     // Return rate limit info in headers
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please slow down." },
});

router.get("/notes/:slug", publicNoteLimiter, getSharedNote);

export default router;