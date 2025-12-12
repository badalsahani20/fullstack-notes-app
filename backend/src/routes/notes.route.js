import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { createNote, deleteNote, getAllNotes, togglePin, updateNote, getNoteById } from "../controllers/notes.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getAllNotes);

router.post("/", authMiddleware, createNote);

router.get("/:id", authMiddleware, getNoteById);

router.put("/:id", authMiddleware, updateNote);

router.delete("/:id", authMiddleware, deleteNote);

router.patch("/:id/pin", authMiddleware, togglePin);

export default router;