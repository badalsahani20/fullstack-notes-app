import crypto from "crypto";
import Notes from "../models/notes.model.js";
import AiAssistCache from "../models/aiAssistCache.model.js";
import catchAsync from "../utils/catchAsync.js";
import { checkGrammar, chatWithAi, runAiAssist, generateTitle } from "../services/ai.service.js";
import GlobalChatSession from "../models/globalChatSession.model.js";
import { stripHtml } from "../utils/stripHtml.js";

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


export const chatWithAiController = catchAsync(async (req, res) => {
  const { message, noteContext = "", imageBase64, sessionId } = req.body;

  if ((!message || !message.trim()) && !imageBase64) {
    return res.status(400).json({
      success: false,
      message: "Message or Image is required",
    });
  }

  const isGlobalChat = !noteContext || !noteContext.trim();

  // Load stored history from DB
  let session = null;
  let history = [];

  if (isGlobalChat) {
    if (sessionId) {
      // Resume an existing session — verify it belongs to this user
      session = await GlobalChatSession.findOne({ _id: sessionId, user: req.user._id });
      if (!session) {
        return res.status(404).json({ success: false, message: "Session not found" });
      }
    }
    // If no sessionId: null session → will create a brand new one after the AI replies

    if (session) {
      history = session.messages.map((m) => ({ role: m.role, content: m.content }));
    }
  } else {
    // In-editor chat: frontend still manages history
    history = Array.isArray(req.body.history) ? req.body.history : [];
  }

  // Call the AI service
  const result = await chatWithAi({
    message,
    history,
    summary: req.body.summary || "",
    noteContext,
    imageBase64,
  });

  // Persist to DB if global chat
  let activeSessionId = sessionId;
  if (isGlobalChat) {
    const safeUserContent = imageBase64
      ? `[User attached an image] ${message}`.trim()
      : message;

    const newMessages = [
      { role: "user", content: safeUserContent },
      { role: "assistant", content: result.reply },
    ];

    if (session) {
      // Append to existing session
      const isFirstMessage = session.messages.length === 0;
      session.messages.push(...newMessages);
      await session.save(); // pre-save hook trims to cap

      if (isFirstMessage) {
        await generateTitle(message)
          .then((title) => GlobalChatSession.findByIdAndUpdate(session._id, { title }).exec())
          .catch(() => {});
      }
    } else {
      // Create a brand new session
      const newSession = await GlobalChatSession.create({
        user: req.user._id,
        messages: newMessages,
      });
      activeSessionId = newSession._id; // return new sessionId to frontend

      await generateTitle(message)
        .then((title) => GlobalChatSession.findByIdAndUpdate(newSession._id, { title }).exec())
        .catch(() => {});
    }
  }

  res.status(200).json({
    success: true,
    data: {
      reply: result.reply,
      sessionId: activeSessionId, // frontend stores this for subsequent messages
    },
  });
});

// GET /api/ai/chat/session/:sessionId — load messages for a specific session
export const getChatSessionController = catchAsync(async (req, res) => {
  const session = await GlobalChatSession
    .findOne({ _id: req.params.sessionId, user: req.user._id })
    .lean();

  if (!session) {
    return res.status(404).json({ success: false, message: "Session not found" });
  }

  res.status(200).json({
    success: true,
    data: {
      messages: session.messages,
      title: session.title,
    },
  });
});

// GET /api/ai/sessions — sidebar: list all sessions (no messages, just metadata)
export const getAllSessionsController = catchAsync(async (req, res) => {
  const sessions = await GlobalChatSession
    .find({ user: req.user._id })
    .select("title updatedAt") // only what the sidebar needs
    .sort({ updatedAt: -1 })   // newest first
    .limit(20)                 // cap at 20 — sidebar doesn't need more
    .lean();

  res.status(200).json({
    success: true,
    data: { sessions },
  });
});
