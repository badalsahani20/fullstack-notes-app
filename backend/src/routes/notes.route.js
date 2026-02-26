import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { createNote, deleteNote, getAllNotes, togglePin, updateNote, getNoteById } from "../controllers/notes.controller.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/", getAllNotes);

router.post("/", createNote);

router.get("/:id", getNoteById);

router.put("/:id", updateNote);

router.delete("/:id", deleteNote);

router.patch("/:id/pin", togglePin);

export default router;