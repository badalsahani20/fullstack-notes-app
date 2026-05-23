import crypto from "crypto";
import User from "../models/user.model.js";
import Notes from "../models/notes.model.js";
import AiAssistCache from "../models/aiAssistCache.model.js";
import catchAsync from "../utils/catchAsync.js";
import {
  checkGrammar,
  chatWithAi,
  runAiAssist,
  generateTitle,
  getDynamicPrompts,
  performWebSearch,
  crawlUrl,
  detectTools,
} from "../services/ai.service.js";
import GlobalChatSession from "../models/globalChatSession.model.js";
import { stripHtml } from "../utils/stripHtml.js";
import { parseIrisResponse } from "../utils/parseIrisResponse.js";
import getEffectiveDailyLimit from "../utils/getEffectiveDailyLimit.js";
import { SseStreamParser } from "../utils/sseParser.js";

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
    "note",
    "this",
    "content",
    "text",
    "document",
    // Action verbs
    "summarize",
    "summary",
    "explain",
    "rewrite",
    "improve",
    "fix",
    "check",
    "review",
    "analyze",
    "analyse",
    "translate",
    "continue",
    "expand",
    "shorten",
    "simplify",
    "edit",
    "update",
    "help me",
    "help with",
    "work on",
    "look at",
    // Structure references
    "bullet",
    "point",
    "section",
    "paragraph",
    "heading",
    "title",
    "step",
    "part",
    "line",
    "chapter",
    // Question patterns
    "what does",
    "what is in",
    "tell me",
    "read",
    "above",
    "wrote",
    "written",
    "about",
    "based on",
    "from my",
  ];
  return noteKeywords.some((kw) => lower.includes(kw));
};

const mightNeedWeb = (msg) => {
  const lower = msg.toLowerCase();
  return (
    /https?:\/\/[^\s]+/.test(msg) || // ✅ matches actual URLs
    /\b(search(?:ing|es|ed)?|google|look up|find online|browse|web|internet|website|article|link|url)\b/.test(
      lower,
    ) || // ✅ explicit search intents
    /\b(latest|recent|new|news|now|current|today|release|update|version|stock|price|rate|conversion|weather)\b/.test(
      lower,
    ) || // Timely keywords
    /\b(api|documentation|lib|package|framework|how to install)\b/.test(
      lower,
    ) || // Technical gaps
    /[\$\€]/.test(msg) // Currency triggers
  );
};

const hashText = (text = "") =>
  crypto
    .createHash("sha256")
    .update(normalizeForHash(text), "utf8")
    .digest("hex");

const cleanSessionTitle = (title = "") => {
  const cleaned = title
    .replace(/^title\s*:\s*/i, "")
    .replace(/^["'`*_#\s]+|["'`*_#\s]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (
    !cleaned ||
    /generate|descriptive|return only|no quotes|input content|task:/i.test(
      cleaned,
    )
  ) {
    return "New Chat";
  }

  return cleaned.slice(0, 54);
};

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

  if (!action) {
    return res
      .status(400)
      .json({ success: false, message: "action is required" });
  }

  // 1. Resolve Note and Source Text
  let note = null;
  // noteId is null when the note hasn't been saved yet (stateless mode for new notes)
  if (noteId && noteId !== "new") {
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

  // Reserve a daily credit only after validation and cache lookup.
  // If the model request fails, the credit is refunded below.
  let creditReserved = false;
  const rateLimitResult = await checkAndIncrementRateLimit(req.user._id);
  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      success: false,
      code: "AI_DAILY_LIMIT_EXCEEDED",
      message: `Daily AI usage limit reached. Used ${rateLimitResult.used} of ${rateLimitResult.limit} today.`,
    });
  }
  creditReserved = true;

  // 3. Call AI Service (Stream or Static)
  let result;
  try {
    result = await runAiAssist({
      action,
      text: sourceText,
      stream: !!stream,
    });
  } catch (error) {
    if (creditReserved) await refundDailyCount(req.user._id);
    throw error;
  }

  if (stream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let finalSuggestion = "";
    const parser = new SseStreamParser();
    const responseDecoder = new TextDecoder();

    try {
      for await (const chunk of result) {
        let chunkText = "";

        if (typeof chunk.text === "function") {
          // Gemini Path
          chunkText = chunk.text();
          res.write(
            `data: ${JSON.stringify({ choices: [{ delta: { content: chunkText } }] })}\n\n`,
          );
          finalSuggestion += chunkText;
        } else {
          // OpenRouter Path
          const rawChunkText = responseDecoder.decode(chunk, { stream: true });
          res.write(rawChunkText);

          // Use parser to safely reconstruct fragmented lines for backend caching
          const events = parser.processChunk(chunk);
          for (const data of events) {
            if (data.type === "error" || data.error) {
              const errorMsg =
                data.message || data.error?.message || "AI model error";
              throw new Error(errorMsg);
            }

            finalSuggestion += data.choices?.[0]?.delta?.content || "";
          }
        }
      }

      if (!finalSuggestion.trim()) {
        throw new Error("AI model returned an empty response");
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
      if (creditReserved) {
        await refundDailyCount(req.user._id);
        creditReserved = false;
      }
      console.error("AI Assist Stream Error:", err.message);
      res.write(
        `data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`,
      );
    } finally {
      res.end();
    }
    return;
  }

  // 🛡️ Static Path
  try {
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
  } catch (error) {
    if (creditReserved) await refundDailyCount(req.user._id);
    throw error;
  }

  res.status(200).json({
    success: true,
    cached: false,
    data: {
      ...result,
      sourceType,
    },
  });
});

// Chat controller helpers

/* Resolve or create the global chat session and load history */
const resolveSession = async (req) => {
  const { sessionId } = req.body;
  const noteId = req.body.noteId || null;
  const isGlobalChat =
    !noteId &&
    typeof req.body.noteId === "undefined" &&
    typeof req.body.noteContext === "undefined";

  let session = null;
  let history = [];
  let summary = "";

  if (isGlobalChat) {
    if (sessionId) {
      session = await GlobalChatSession.findOne({
        _id: sessionId,
        user: req.user._id,
      });
    }
    if (session) {
      history = session.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      summary = session.summary || "";
    }
  } else {
    history = Array.isArray(req.body.history) ? req.body.history : [];
  }

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

  return {
    isGlobalChat,
    noteId,
    session,
    history,
    summary: summary || "",
    activeSessionId,
    activeSession,
  };
};

// Run tool detection (web search / URL crawl) and return context + tool name
const resolveToolContext = async (message, res, isStreaming) => {
  let toolContext = "";
  let toolUsed = null;

  if (!mightNeedWeb(message)) return { toolContext, toolUsed };

  const toolDecision = await detectTools(message);

  if (toolDecision.tool === "search_web") {
    toolUsed = "search_web";
    if (isStreaming)
      res.write(
        `data: ${JSON.stringify({ type: "tool_call", tool: "search_web" })}\n\n`,
      );
    const searchResults = await performWebSearch(toolDecision.query);
    toolContext = `\n[WEB SEARCH RESULTS for "${toolDecision.query}"]\n${searchResults}\n[/end of web search results]\n`;
  } else if (toolDecision.tool === "crawl_url") {
    toolUsed = "crawl_url";
    if (isStreaming)
      res.write(
        `data: ${JSON.stringify({ type: "tool_call", tool: "crawl_url" })}\n\n`,
      );
    const pageContent = await crawlUrl(toolDecision.query);
    toolContext = `\n[WEBPAGE CONTENT from ${toolDecision.query}]\n${pageContent.slice(0, 6000)}\n[END WEBPAGE]\n`;
  }

  return { toolContext, toolUsed };
};

// Fetch note context from the DB or frontend payload (skipped when a tool was used)
const resolveNoteContext = async (
  req,
  { isGlobalChat, noteId, history, toolUsed },
) => {
  const { noteContext: reqNoteContext, hasSelection, message } = req.body;
  let noteContext = "";
  let noteFetched = false;

  // Only fetch note context if the message is actually about the note/editor context.
  // We allow this even if a tool was used, so you can compare web data with note data.
  const isNoteQuery =
    noteId && (hasSelection || shouldFetchNote(message, history));
  const shouldIncludeContext = !!isNoteQuery;

  if (shouldIncludeContext) {
    if (reqNoteContext) {
      noteContext = hasSelection
        ? `[User specifically highlighted this text in their editor]:\n${reqNoteContext}`
        : `[user's current editor context]:\n${reqNoteContext}`;
    } else {
      const note = await Notes.findOne({
        _id: noteId,
        user: req.user._id,
      }).lean();
      if (note?.content) {
        noteContext = `Title: ${note.title || "Untitled"}\n\n${stripHtml(note.content).slice(0, 1500)}`;
        noteFetched = true;
      }
    }
  }

  return { noteContext, noteFetched };
};

// Set up SSE headers and fire the keep-alive comment
const openSseConnection = (res, activeSessionId) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Expose-Headers", "X-Session-Id");
  if (activeSessionId)
    res.setHeader("X-Session-Id", activeSessionId.toString());
  res.write(": keep-alive\n\n");
};

// Pipe OpenRouter SSE chunks to the client and accumulate the full reply
const streamAiResponse = async (stream, res, noteFetched) => {
  const decoder = new TextDecoder();
  let finalReply = "";
  const parser = new SseStreamParser();

  if (noteFetched) {
    res.write(
      `data: ${JSON.stringify({ type: "tool_call", tool: "get_note_content" })}\n\n`,
    );
  }

  for await (const chunk of stream) {
    const text = decoder.decode(chunk, { stream: true });
    res.write(text);

    const events = parser.processChunk(chunk);

    for (const data of events) {
      const choice = data.choices?.[0];

      // Intercept and detect tool calls delta
      if (choice?.delta?.tool_calls) {
        for (const tc of choice.delta.tool_calls) {
          const toolName = tc.function?.name;
          if (
            toolName === "openrouter:web_search" ||
            toolName === "openrouter:web_fetch"
          ) {
            const normTool =
              toolName === "openrouter:web_search" ? "search_web" : "crawl_url";
            res.write(
              `data: ${JSON.stringify({ type: "tool_call", tool: normTool })}\n\n`,
            );
          }
        }
      }

      finalReply +=
        choice?.delta?.content ||
        choice?.message?.content ||
        data.content ||
        data.text ||
        "";
    }
  }

  return finalReply;
};

// Save the completed turn to the global-chat session in MongoDB
const persistToDb = async (
  message,
  finalReply,
  imageBase64,
  activeSessionId,
  activeSession,
  summary = "",
) => {
  const isImageUrl =
    typeof imageBase64 === "string" && /^https?:\/\//i.test(imageBase64);
  const safeUserContent = imageBase64
    ? `${isImageUrl ? `[Attached Image](${imageBase64})` : "[Attached Image]"}\n${message}`.trim()
    : message;

  const sessionToUpdate =
    activeSession || (await GlobalChatSession.findById(activeSessionId));
  if (!sessionToUpdate) return;

  if (!finalReply?.trim()) {
    console.warn(
      "Skipping chat persistence because assistant reply was empty.",
    );
    return;
  }

  sessionToUpdate.messages.push(
    { role: "user", content: safeUserContent },
    { role: "assistant", content: finalReply },
  );
  if (summary) sessionToUpdate.summary = summary;
  await sessionToUpdate.save();

  const shouldGenerateTitle =
    (!sessionToUpdate.title || sessionToUpdate.title === "New Chat") &&
    sessionToUpdate.messages.filter((msg) => msg.role === "user").length >= 2;

  if (shouldGenerateTitle) {
    console.log("🏷️ Generating title for session:", activeSessionId);
    const titleContext = sessionToUpdate.messages
      .slice(0, 6)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n\n");

    generateTitle(titleContext)
      .then((title) => {
        console.log("✅ Title generated:", title);
        return GlobalChatSession.findByIdAndUpdate(activeSessionId, {
          title,
        }).exec();
      })
      .catch((err) => console.error("❌ Title update failed:", err.message));
  }
};

//  Main chat controller

export const chatWithAiController = catchAsync(async (req, res) => {
  const { message, imageBase64, pdfContext, stream, useReasoning, enableWeb } =
    req.body;

  if ((!message || !message.trim()) && !imageBase64) {
    return res
      .status(400)
      .json({ success: false, message: "Message or Image is required" });
  }

  // 1. Resolve session & history
  const sessionData = await resolveSession(req);
  const {
    isGlobalChat,
    history,
    summary: sessionSummary,
    activeSessionId,
    activeSession,
  } = sessionData;

  if (isGlobalChat && req.body.sessionId && !sessionData.session) {
    return res
      .status(404)
      .json({ success: false, message: "Session not found" });
  }

  // 2. Open SSE early so the browser isn't waiting blind
  const isStreaming = !!stream;
  const shouldSearchWeb = enableWeb !== false; // Default to true if not provided

  if (isStreaming) {
    openSseConnection(res, activeSessionId);
    if (shouldSearchWeb && mightNeedWeb(message)) {
      res.write(
        `data: ${JSON.stringify({ type: "tool_call", tool: "search_web" })}\n\n`,
      );
    }
  }

  // 3. Note context (always fetched when relevant to note context)
  const { noteContext, noteFetched } = await resolveNoteContext(req, {
    ...sessionData,
    toolUsed: null,
  });

  // 4. Call the AI service
  let result;
  try {
    const finalSystemPrompt = `You are Iris, a high-performance Agentic AI Assistant.
CRITICAL: You have access to real-time search tools (web_search and web_fetch) to fetch the latest data whenever needed. Speak as if you are browsing live.

INSTRUCTIONS & FORMATTING RULES:
1. Whenever you perform a search or fetch to obtain information, you MUST cite the source URLs inline (e.g., "[Source: domain.com](URL)").
2. Always include a brief "Sources" section at the end of your response with clickable markdown links if external data was used.
3. If you search the web but cannot find the specific information, explain that clearly. Do NOT make up facts.
4. Use rounded values for precise numerical data to avoid floating point representation errors.
5. When generating Mermaid diagrams, ALWAYS wrap node labels in double quotes to prevent syntax errors (e.g., A["Label Here"] instead of A[Label Here]).

${noteContext ? `[EDITOR CONTEXT / NOTE DATA]:\n${noteContext}\n` : ""}

Use the tools and any provided context to answer the user's query accurately.`;

    result = await chatWithAi({
      message,
      history,
      summary: sessionSummary || req.body.summary || "",
      noteContext: noteContext,
      webContext: "",
      systemPrompt: finalSystemPrompt,
      pdfContext: pdfContext || "",
      imageBase64,
      stream: isStreaming,
      useReasoning: useReasoning !== false,
      enableWeb: shouldSearchWeb,
    });
  } catch (aiError) {
    console.error("❌ All AI models failed:", aiError.message);
    if (isStreaming) {
      res.write(
        `data: ${JSON.stringify({ type: "error", message: "AI service unavailable" })}\n\n`,
      );
      res.end();
    }
    return;
  }

  // 6. Stream or return the response
  let finalReply = "";

  if (isStreaming) {
    try {
      finalReply = await streamAiResponse(result.stream, res, noteFetched);
      // Send metadata (like extracted PDF text) after the stream completes
      if (result.pdfContext) {
        res.write(
          `data: ${JSON.stringify({ type: "metadata", pdfContext: result.pdfContext })}\n\n`,
        );
      }
    } catch (streamError) {
      console.error("Streaming error:", streamError.message);
    } finally {
      res.end();
    }
  } else {
    finalReply = result.reply;
  }

  // 7. Persist to DB (global chat only)
  if (isGlobalChat && activeSessionId) {
    await persistToDb(
      message,
      finalReply,
      imageBase64,
      activeSessionId,
      activeSession,
      result.summary,
    );
  }

  if (isStreaming) return;

  // 8. Static JSON response
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
      pdfContext: result.pdfContext,
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
      title: cleanSessionTitle(session.title),
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
    data: {
      sessions: sessions.map((session) => ({
        ...session,
        title: cleanSessionTitle(session.title),
      })),
    },
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

async function incrementDailyCount(userId) {
  const now = new Date();
  // Midnight of today in server's local time
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  // Atomic update: if lastResetAt is before today OR doesn't exist, reset to 1.
  const resetUpdate = await User.findOneAndUpdate(
    {
      _id: userId,
      $or: [
        { "aiUsage.lastResetAt": { $lt: startOfToday } },
        { "aiUsage.lastResetAt": { $exists: false } },
        { aiUsage: { $exists: false } },
      ],
    },
    { $set: { "aiUsage.dailyCount": 1, "aiUsage.lastResetAt": now } },
  );

  // If the above didn't match anything, it means lastResetAt is today. Just increment.
  if (!resetUpdate) {
    await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { "aiUsage.dailyCount": 1 } },
    );
  }
}

async function refundDailyCount(userId) {
  await User.findOneAndUpdate(
    { _id: userId, "aiUsage.dailyCount": { $gt: 0 } },
    { $inc: { "aiUsage.dailyCount": -1 } },
  );
}

async function checkAndIncrementRateLimit(userId) {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  // Fetch only the fields we need — don't load the whole user document
  const user = await User.findById(userId).select("aiUsage");
  if (!user) return { allowed: false, reason: "User not found" };

  const limit = getEffectiveDailyLimit(user);

  // If their last reset was yesterday (or earlier), or missing, their effective count is 0
  const isNewDay =
    !user.aiUsage?.lastResetAt || user.aiUsage.lastResetAt < startOfToday;
  const effectiveCount = isNewDay ? 0 : user.aiUsage?.dailyCount || 0;

  if (effectiveCount >= limit) {
    return { allowed: false, used: effectiveCount, limit };
  }

  // Under the limit — record this usage
  await incrementDailyCount(userId);
  return { allowed: true, used: effectiveCount + 1, limit };
}
