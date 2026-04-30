import crypto from "crypto";
import Notes from "../models/notes.model.js";
import AiAssistCache from "../models/aiAssistCache.model.js";
import catchAsync from "../utils/catchAsync.js";
import {
  checkGrammar,
  chatWithAi,
  runAiAssist,
  generateTitle,
  getDynamicPrompts,
} from "../services/ai.service.js";
import GlobalChatSession from "../models/globalChatSession.model.js";
import { stripHtml } from "../utils/stripHtml.js";
import { parseIrisResponse } from "../utils/parseIrisResponse.js";

const normalizeForHash = (text = "") => text.replace(/\s+/g, " ").trim();

/**
 * Fetch note context when the message is plausibly about the note.
 * First turn always fetches. Follow-ups fetch on broad note-related keywords.
 * Clearly off-topic messages (greetings, math, general questions) are skipped.
 */
const shouldFetchNote = (message = "", history = []) => {
  if (!history || history.length === 0) return true;

  const lower = message.toLowerCase();
  const noteKeywords = [
    // Direct references
    "note", "this", "content", "text", "document",
    // Action verbs
    "summarize", "summary", "explain", "rewrite", "improve",
    "fix", "check", "review", "analyze", "analyse", "translate",
    "continue", "expand", "shorten", "simplify", "edit", "update",
    "help me", "help with", "work on", "look at",
    // Structure references
    "bullet", "point", "section", "paragraph", "heading",
    "title", "step", "part", "line", "chapter",
    // Question patterns
    "what does", "what is in", "tell me", "read", "above",
    "wrote", "written", "about", "based on", "from my",
  ];
  return noteKeywords.some((kw) => lower.includes(kw));
};

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
  const { noteId, action, selectedText, noteText, stream } = req.body;

  if (!noteId || !action) {
    return res
      .status(400)
      .json({ success: false, message: "noteId and action are required" });
  }

  // 1. Resolve Note and Source Text
  let note = null;
  if (noteId !== "new") {
    note = await Notes.findOne({ _id: noteId, user: req.user._id });
    if (!note) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });
    }
  }

  const hasSelection = Boolean(selectedText && selectedText.trim());
  const sourceType = hasSelection ? "selection" : "note";
  const sourceText =
    (selectedText && selectedText.trim()) ||
    (noteText && noteText.trim()) ||
    (note ? stripHtml(note.content) : "");

  if (!sourceText || !sourceText.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Text is required for AI assist" });
  }

  const inputHash = hashText(sourceText);

  // 2. Check Cache First
  const cached = await AiAssistCache.findOne({
    user: req.user._id,
    note: note?._id || null,
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

  // 3. Call AI Service (Stream or Static)
  const result = await runAiAssist({
    action,
    text: sourceText,
    stream: !!stream,
  });

  if (stream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let finalSuggestion = "";
    const decoder = new TextDecoder();

    try {
      for await (const chunk of result) {
        let chunkText = "";

        if (typeof chunk.text === "function") {
          // Gemini Path
          chunkText = chunk.text();
          res.write(
            `data: ${JSON.stringify({ choices: [{ delta: { content: chunkText } }] })}\n\n`,
          );
        } else {
          // OpenRouter Path
          chunkText = decoder.decode(chunk);
          res.write(chunkText);
        }

        // Accumulate clean text for caching
        if (typeof chunk.text === "function") {
          finalSuggestion += chunkText;
        } else {
          const lines = chunkText.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const data = JSON.parse(line.slice(6));
                finalSuggestion += data.choices?.[0]?.delta?.content || "";
              } catch (e) {}
            }
          }
        }
      }

      // Save the streamed result to cache after completion
      await AiAssistCache.findOneAndUpdate(
        {
          user: req.user._id,
          note: note?._id || null,
          action,
          sourceType,
          inputHash,
        },
        {
          user: req.user._id,
          note: note?._id || null,
          action,
          sourceType,
          inputHash,
          noteUpdatedAt: note?.updatedAt || new Date(),
          response: {
            action,
            suggestion: finalSuggestion,
            original: sourceText,
            errors: [],
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    } catch (err) {
      console.error("AI Assist Stream Error:", err.message);
    } finally {
      res.end();
    }
    return;
  }

  // 🛡️ Static Path
  if (action === "grammar" && !hasSelection && note) {
    note.grammarErrors = result.errors;
    await note.save();
  }

  await AiAssistCache.findOneAndUpdate(
    {
      user: req.user._id,
      note: note?._id || null,
      action,
      sourceType,
      inputHash,
    },
    {
      user: req.user._id,
      note: note?._id || null,
      action,
      sourceType,
      inputHash,
      noteUpdatedAt: note?.updatedAt || new Date(),
      response: {
        action: result.action,
        suggestion: result.suggestion,
        errors: result.errors || [],
        original: result.original || "",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
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
  const { message, imageBase64, sessionId, stream, noteContext: reqNoteContext, hasSelection } = req.body;
  const noteId = req.body.noteId || null;

  if ((!message || !message.trim()) && !imageBase64) {
    return res.status(400).json({
      success: false,
      message: "Message or Image is required",
    });
  }

  // Editor chat sends noteId; global chat omits it entirely
  const isGlobalChat = !noteId && typeof req.body.noteId === "undefined" && typeof req.body.noteContext === "undefined";

  // Load stored history from DB
  let session = null;
  let history = [];

  if (isGlobalChat) {
    if (sessionId) {
      session = await GlobalChatSession.findOne({
        _id: sessionId,
        user: req.user._id,
      });
      if (!session) {
        return res
          .status(404)
          .json({ success: false, message: "Session not found" });
      }
    }

    if (session) {
      history = session.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
    }
  } else {
    history = Array.isArray(req.body.history) ? req.body.history : [];
  }

  // 🆔 Generate session ID early for new chats
  let activeSessionId = sessionId;
  let activeSession = session;

  if (isGlobalChat && !activeSessionId) {
    const newSession = await GlobalChatSession.create({
      user: req.user._id,
      messages: [],
    });
    activeSessionId = newSession._id;
    activeSession = newSession;
  }

  // 📝 Fetch note from DB when the message is note-related (broad keyword heuristic)
  let noteContext = "";
  let noteFetched = false;
  // Rule: Include context if user highlighted text OR if the message uses keywords
  const shouldIncludeContext = !isGlobalChat && noteId && (hasSelection || shouldFetchNote(message, history));
  if (shouldIncludeContext) {
    if(reqNoteContext) {
      // use frontend context
      noteContext = hasSelection ? `[User specifically highlighted this text in their editor]:\n${reqNoteContext}`:
      `[user's current editor context]:\n${reqNoteContext}`
    }else {
      const note = await Notes.findOne({ _id: noteId, user: req.user._id}).lean();
      if(note?.content) {
        noteContext = `Title: ${note.title || "Untitled"}\n\n${stripHtml(note.content).slice(0, 1500)}`;
        noteFetched = true;
      }else {
        console.log("⏭️  Note fetch skipped — empty content");
      }
    }
  } else if (!isGlobalChat && noteId) {
    console.log("⏭️  Note context skipped — no selection and not note-related");
  }

  let finalReply = "";

  // ── Open SSE connection immediately so the browser isn't waiting blind ──────
  if (stream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Expose-Headers", "X-Session-Id");
    if (activeSessionId)
      res.setHeader("X-Session-Id", activeSessionId.toString());
    // Keep-alive comment — tells the browser the connection is live while AI thinks
    res.write(": keep-alive\n\n");
  }

  // 🚀 Call the AI service (full fallback waterfall via chatWithAi)
  let result;
  try {
    result = await chatWithAi({
      message,
      history,
      summary: req.body.summary || "",
      noteContext,
      imageBase64,
      stream: !!stream,
    });
  } catch (aiError) {
    console.error("❌ All AI models failed:", aiError.message);
    // SSE connection is already open — can't use the global error handler
    if (stream) {
      res.write(`data: ${JSON.stringify({ type: "error", message: "AI service unavailable" })}\n\n`);
      res.end();
    }
    return;
  }

  if (stream) {
    const decoder = new TextDecoder();

    try {
      // Emit tool activity event so the UI shows "📄 Read note"
      if (noteFetched) {
        res.write(`data: ${JSON.stringify({ type: "tool_call", tool: "get_note_content" })}\n\n`);
      }

      for await (const chunk of result) {
        const text = decoder.decode(chunk);
        res.write(text); // Pipe raw SSE chunks to frontend

        // Accumulate clean text for DB persistence
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              finalReply += data.choices?.[0]?.delta?.content || "";
            } catch (e) {
              // Handle partial JSON or [DONE] tag
            }
          }
        }
      }
    } catch (streamError) {
      console.error("Streaming error:", streamError.message);
    } finally {
      res.end();
    }
  } else {
    finalReply = result.reply;
  }

  // 💾 Persist completion to DB
  if (isGlobalChat && activeSessionId) {
    const safeUserContent = imageBase64
      ? `[User attached an image] ${message}`.trim()
      : message;
    const newMessages = [
      { role: "user", content: safeUserContent },
      { role: "assistant", content: finalReply },
    ];

    const sessionToUpdate =
      activeSession || (await GlobalChatSession.findById(activeSessionId));
    if (sessionToUpdate) {
      const isFirstMessage = sessionToUpdate.messages.length === 0;
      sessionToUpdate.messages.push(...newMessages);
      await sessionToUpdate.save();

      if (isFirstMessage) {
        generateTitle(message)
          .then((title) =>
            GlobalChatSession.findByIdAndUpdate(activeSessionId, {
              title,
            }).exec(),
          )
          .catch(() => {});
      }
    }
  }
  // If we streamed, we already ended the response. Exit.
  if (stream) return;

  // Otherwise, send final JSON for static calls
  res.status(200).json({
    success: true,
    data: {
      reply: finalReply,
      segments: parseIrisResponse(finalReply),
      history: [
        ...history,
        { role: "user", content: message },
        { role: "assistant", content: finalReply },
      ],
      sessionId: activeSessionId,
    },
  });
});

// GET /api/ai/chat/session/:sessionId — load messages for a specific session
export const getChatSessionController = catchAsync(async (req, res) => {
  const session = await GlobalChatSession.findOne({
    _id: req.params.sessionId,
    user: req.user._id,
  }).lean();

  if (!session) {
    return res
      .status(404)
      .json({ success: false, message: "Session not found" });
  }

  res.status(200).json({
    success: true,
    data: {
      messages: session.messages.map((message) => ({
        ...message,
        segments:
          message.role === "assistant"
            ? parseIrisResponse(message.content)
            : undefined,
      })),
      title: session.title,
    },
  });
});

// GET /api/ai/sessions — sidebar: list all sessions (no messages, just metadata)
export const getAllSessionsController = catchAsync(async (req, res) => {
  const sessions = await GlobalChatSession.find({ user: req.user._id })
    .select("title updatedAt") // only what the sidebar needs
    .sort({ updatedAt: -1 }) // newest first
    .limit(20) // cap at 20 — sidebar doesn't need more
    .lean();

  res.status(200).json({
    success: true,
    data: { sessions },
  });
});

// GET /api/public/prompts — dynamic quick prompts for the chat empty state
export const getDynamicPromptsController = catchAsync(async (req, res) => {
  const prompts = await getDynamicPrompts();

  res.status(200).json({
    success: true,
    data: prompts,
  });
});
