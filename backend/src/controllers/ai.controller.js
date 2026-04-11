import crypto from "crypto";
import Notes from "../models/notes.model.js";
import AiAssistCache from "../models/aiAssistCache.model.js";
import catchAsync from "../utils/catchAsync.js";
import { checkGrammar, chatWithAi, runAiAssist } from "../services/ai.service.js";

const stripHtml = (html = "") =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeForHash = (text = "") => text.replace(/\s+/g, " ").trim();

const hashText = (text = "") =>
  crypto
    .createHash("sha256")
    .update(normalizeForHash(text), "utf8")
    .digest("hex");

export const checkGrammarController = catchAsync(async (req, res) => {
  const { noteId } = req.params;

  const note = await Notes.findOne({ _id: noteId, user: req.user._id });
  if (!note) {
    return res.status(404).json({ success: false, message: "Note not found" });
  }

  const sourceText = stripHtml(note.content);
  const result = await checkGrammar(sourceText);
  note.grammarErrors = result.errors;
  await note.save();

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const aiAssistController = catchAsync(async (req, res) => {
  const { noteId, action, selectedText, noteText } = req.body;

  if (!noteId || !action) {
    return res.status(400).json({ success: false, message: "noteId and action are required" });
  }

  // Handle "new" notes that aren't in the DB yet
  if (noteId === "new") {
    const hasSelection = Boolean(selectedText && selectedText.trim());
    const sourceType = hasSelection ? "selection" : "note";
    const sourceText = (selectedText && selectedText.trim()) || (noteText && noteText.trim());

    if (!sourceText || !sourceText.trim()) {
      return res.status(400).json({ success: false, message: "Text is required for AI assist" });
    }

    const result = await runAiAssist({ action, text: sourceText });
    return res.status(200).json({
      success: true,
      cached: false,
      data: { ...result, sourceType },
    });
  }

  const note = await Notes.findOne({ _id: noteId, user: req.user._id });
  if (!note) {
    return res.status(404).json({ success: false, message: "Note not found" });
  }

  const hasSelection = Boolean(selectedText && selectedText.trim());
  const sourceType = hasSelection ? "selection" : "note";
  const sourceText = (selectedText && selectedText.trim()) || (noteText && noteText.trim()) || stripHtml(note.content);

  if (!sourceText || !sourceText.trim()) {
    return res.status(400).json({ success: false, message: "Text is required for AI assist" });
  }

  const inputHash = hashText(sourceText);

  const cached = await AiAssistCache.findOne({
    user: req.user._id,
    note: note._id,
    action,
    sourceType,
    inputHash,
    noteUpdatedAt: note.updatedAt,
  }).lean();

  if (cached?.response) {
    return res.status(200).json({
      success: true,
      cached: true,
      data: {
        ...cached.response,
        sourceType,
      },
    });
  }

  const result = await runAiAssist({ action, text: sourceText });

  if (action === "grammar" && !hasSelection) {
    note.grammarErrors = result.errors;
    await note.save();
  }

  await AiAssistCache.findOneAndUpdate(
    {
      user: req.user._id,
      note: note._id,
      action,
      sourceType,
      inputHash,
      noteUpdatedAt: note.updatedAt,
    },
    {
      user: req.user._id,
      note: note._id,
      action,
      sourceType,
      inputHash,
      noteUpdatedAt: note.updatedAt,
      response: {
        action: result.action,
        suggestion: result.suggestion,
        errors: result.errors || [],
        original: result.original || "",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({
    success: true,
    cached: false,
    data: {
      ...result,
      sourceType,
    },
  });
});


export const chatWithAiController = catchAsync( async (req, res) => {
  const { message, history = [], summary = "", noteContext = "", contextChanged = false, imageBase64 } = req.body;

  if ((!message || !message.trim()) && !imageBase64) {
    return res.status(400).json({
      success: false,
      message: "Message or Image is required",
    });
  }

  if (!Array.isArray(history)) {
    return res.status(400).json({
      success: false,
      message: "History must be an array",
    });
  }

  const result = await chatWithAi({
    message,
    history,
    summary,
    noteContext,
    contextChanged,
    imageBase64,
  });

  res.status(200).json({
    success: true,
    data: {
      reply: result.reply,
      history: result.history,
    },
  });
});
