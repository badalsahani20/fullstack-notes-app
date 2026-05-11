import { diffWords } from "diff";
import { PDFParse } from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { mapDiffsToError } from "../utils/mapDiffsToError.js";
import { client } from "../utils/groqClient.js";
import { summarizeHistory } from "../utils/summarizeHistory.js";
import { OpenRouter } from "@openrouter/sdk";
import Prompt from "../models/prompts.model.js";
import { parseIrisResponse } from "../utils/parseIrisResponse.js";

// --- CONFIGURATION ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

export const PRIMARY_MODEL = "deepseek/deepseek-v4-flash";

const FALLBACK_MODEL = "llama-3.3-70b-versatile";

// --- VALIDATION HELPERS ---
const ensureAiApiKey = () => {
  if (!process.env.GEMINI_API_KEY && !process.env.OPEN_ROUTER) {
    throw new Error(`Both GEMINI and OPENROUTER api keys are missing`);
  }
};

const ensureGroqApiKey = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ api key is missing");
  }
};

// --- CORE AI EXECUTION FUNCTIONS ---

export const executeOpenRouter = async (
  modelId,
  messages,
  stream = false,
  includeReasoning = true,
) => {
  const isQwenModel = modelId.toLowerCase().includes("qwen");
  const apiKey =
    isQwenModel && process.env.QWEN_API
      ? process.env.QWEN_API
      : process.env.OPEN_ROUTER;

  if (!apiKey) throw new Error("No OpenRouter or Qwen API Key found");

  const bodyPayload = {
    model: modelId,
    messages: messages,
    stream: stream,
  };

  // Only attach include_reasoning if requested (prevents errors on vision models)
  if (includeReasoning) {
    bodyPayload.include_reasoning = true;
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.BACKEND_URL || "http://localhost:5500",
      "X-Title": "Notesify AI Assistant",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `OpenRouter returned ${response.status}: ${JSON.stringify(errorData)}`,
    );
  }

  //If streaming return the raw response body
  if (stream) return response.body;

  const data = await response.json();

  // OpenRouter sometimes returns 200 OK but embeds the error in the body.
  // Detect both the error object format and the "model output error" string pattern.
  const choice = data.choices?.[0];
  const content = choice?.message?.content;

  if (data.error) {
    throw new Error(`OpenRouter model error: ${data.error.message ?? JSON.stringify(data.error)}`);
  }

  if (!content) throw new Error(`OpenRouter (${modelId}) returned no content`);

  // Detect inline error strings the model embeds in its output
  if (typeof content === "string" && content.startsWith("Error") && content.includes("model output error")) {
    throw new Error(`Model output error (${modelId}): ${content.slice(0, 300)}`);
  }

  return content;
};

const executeNvidia = async (messages, stream = false) => {
  if (!process.env.NVIDIA_API_KEY) throw new Error("No NVIDIA API Key");

  console.log("🟦 Attempting NVIDIA (Gemma 3 27B)...");

  const response = await fetch(
    "https://integrate.api.nvidia.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it",
        messages: messages,
        stream: stream,
        max_tokens: 1024,
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(
      "❌ NVIDIA error:",
      response.status,
      JSON.stringify(errorData),
    );
    throw new Error(
      `NVIDIA returned ${response.status}: ${JSON.stringify(errorData)}`,
    );
  }

  if (stream) return response.body; // ReadableStream — pipe directly like OpenRouter

  const data = await response.json();
  console.log("✅ NVIDIA responded successfully");
  return data.choices[0].message.content;
};

const executeGroq = async (messages) => {
  ensureGroqApiKey();
  if (!client?.chat?.completions)
    throw new Error("Groq client not properly initialized");

  const response = await client.chat.completions.create({
    model: FALLBACK_MODEL,
    messages: messages,
  });
  return response.choices[0].message.content;
};

// Helper: Tries Gemini first, falls back to OpenRouter if Gemini fails or is missing
const generateContentWithFallback = async (prompt, stream = false) => {
  ensureAiApiKey();

  // Try Gemini first if key exists
  if (process.env.GEMINI_API_KEY) {
    try {
      if (stream) {
        const result = await model.generateContentStream(prompt);
        console.log("💎 Action answered by Gemma-3-27b-it (Stream)");
        return result.stream;
      } else {
        const result = await model.generateContent(prompt);
        console.log("💎 Action answered by Gemma-3-27b-it");
        return result.response.text().trim();
      }
    } catch (error) {
      console.warn("Gemini Error, falling back to OpenRouter:", error.message);
      if (!process.env.OPEN_ROUTER) throw error;
    }
  }

  // Fallback to OpenRouter using direct fetch
  if (process.env.OPEN_ROUTER) {
    return await executeOpenRouter(
      "meta-llama/llama-3.1-8b-instruct",
      [{ role: "user", content: prompt }],
      stream,
    );
  }

  throw new Error("No AI feature keys configured");
};

// --- ROUTING & ORCHESTRATION ---

const getAiReply = async (
  message,
  imageBase64,
  systemPrompt,
  history,
  stream = false,
) => {
  // Ensure history content is always text-only strings for safety
  const safeHistory = history.map((h) => ({
    role: h.role,
    content:
      typeof h.content === "string" ? h.content : JSON.stringify(h.content),
  }));

  // 1. Prepare message list for the agentic flow
  const messages = [
    { role: "system", content: systemPrompt },
    ...safeHistory,
    {
      role: "user",
      content: imageBase64
        ? [
            { type: "text", text: message },
            {
              type: "image_url",
              image_url: {
                url: imageBase64.startsWith("data:")
                  ? imageBase64
                  : `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ]
        : message,
    },
  ];

  try {
    // 🔥 TRY PRIMARY: Use DeepSeek for text (with reasoning), swap to Qwen Flash for images (no reasoning)
    const activeModel = imageBase64
      ? "qwen/qwen3.5-flash-02-23"
      : PRIMARY_MODEL;
    const useReasoning = !imageBase64; // Disable reasoning when using the vision model

    const reply = await executeOpenRouter(
      activeModel,
      messages,
      stream,
      useReasoning,
    );
    console.log(
      `🤖 Chat answered by ${activeModel} (Reasoning: ${useReasoning})`,
    );
    return reply;
  } catch (error) {
    console.error("❌ PRIMARY CRASHED:", error.message);
    console.warn("Primary Failed, entering legacy fallback...");

    // 🛡️ LEGACY FALLBACK WATERFALL (Gemma <-> Llama)
    if (imageBase64) {
      try {
        const nvidiaMessages = [
          { role: "system", content: systemPrompt },
          ...safeHistory,
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `[System Directive: Describe image and answer prompt]\n\nUser prompt: ${message}`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:")
                    ? imageBase64
                    : `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ];
        console.log("📷 Falling back to NVIDIA Vision (Llama 3.1 70B)...");
        return await executeNvidia(nvidiaMessages, stream);
      } catch (err) {
        console.warn(
          "Nvidia Vision failed, final fallback to Groq text-only:",
          err.message,
        );
        const groqMessages = [
          { role: "system", content: systemPrompt },
          ...safeHistory,
          {
            role: "user",
            content: `${message}\n\n[System Note: Vision models exhausted. This model is reading a text-only representation.]`,
          },
        ];
        return await executeGroq(groqMessages);
      }
    } else {
      try {
        const groqMessages = [
          { role: "system", content: systemPrompt },
          ...safeHistory,
          { role: "user", content: message },
        ];
        console.log("⚡ Falling back to GROQ (Llama 70B)");
        return await executeGroq(groqMessages);
      } catch (err) {
        console.warn(
          "Groq failed, final fallback to NVIDIA Text:",
          err.message,
        );
        const nvidiaMessages = [
          { role: "system", content: systemPrompt },
          ...safeHistory,
          { role: "user", content: message },
        ];
        return await executeNvidia(nvidiaMessages, stream);
      }
    }
  }
};

// --- EXPORTED SERVICES ---

export const checkGrammar = async (text) => {
  const prompt = `You are a professional editor. Fix grammar, spelling, punctuation, and awkward phrasing while preserving meaning. Return only corrected text.\n\nText:\n${text}`;

  try {
    const correctedText = await generateContentWithFallback(prompt);

    const differences = diffWords(text, correctedText);
    const errorCoordinates = mapDiffsToError(differences);

    return {
      original: text,
      corrected: correctedText,
      errors: errorCoordinates,
    };
  } catch (error) {
    console.error("AI Service Error:", error.message);
    throw error;
  }
};

export const performWebSearch = async (query) => {
  try {
    if (!process.env.TAVILY_API) return "";
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API,
        query: query,
        include_answer: true,
        max_results: 3,
      }),
    });
    const data = await response.json();
    if (!data.results) return "No results found";
    return data.results
      .map((r) => `Title: ${r.title}\nContent: ${r.content}\nURL: ${r.url}`)
      .join("\n\n");
  } catch (error) {
    console.error("Tavily Search Error:", error);
    return "Failed to search the web";
  }
};

export const crawlUrl = async (url) => {
  try {
    if (!process.env.JINA_API) return "";
    const response = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        Authorization: `Bearer ${process.env.JINA_API}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();
    return data.data?.content || data.content || "No content found.";
  } catch (error) {
    console.error("Jina Crawl Error", error);
    return "Failed to crawl URL.";
  }
};

export const mightNeedWeb = (message) => {
  const triggers = [
    "search",
    "current weather",
    "weather",
    "web",
    "latest",
    "news",
    "recent",
    "price",
    "today",
    "current",
    "http",
    "https",
    "www.",
    "documentation",
    "release",
    "version",
    "$",
    "€",
    "price",
    "rate",
    "conversion",
  ];
  const msg = message.toLowerCase();
  return triggers.some((t) => msg.includes(t));
};

export const detectTools = async (message) => {
  try {
    ensureGroqApiKey();
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are a routing agent.

Decide whether the query needs:
- "search_web"
- "crawl_url"
- "none"

Use "search_web" for:
- recent/current/live information
- news, weather, prices, elections, sports
- releases, versions, documentation updates
- anything after 2023

Use "crawl_url" if the user provides a URL and wants it analyzed or summarized.

Otherwise use "none".

Return ONLY JSON:

{
  "tool": "search_web" | "crawl_url" | "none",
  "query": "",
  "reason": ""
}`,
        },
        { role: "user", content: message },
      ],
      response_format: { type: "json_object" },
    });
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Tool Detection Error:", error);
    return { tool: "none" };
  }
};

const actionPrompts = {
  summarize: (text) =>
    `Summarize the following note into concise markdown bullet points. Use hierarchical bullets if necessary. Keep important facts and action items. Return the markdown text only, no code blocks.\n\nNote:\n${text}`,
  explain: (text) =>
    `Explain the following note in simpler language for a beginner. Use markdown for structure. Keep it accurate and clear. Return the markdown text only, no code blocks.Or if user asks a question about the note, answer it in a simple and clear way. Return the answer in markdown text only, no code blocks.\n\nNote:\n${text}`,
  rewrite: (text) =>
    `Rewrite the following text to improve clarity, flow, and grammar while preserving meaning. Use markdown for structural improvements if needed. Return the improved markdown text only, no code blocks.\n\nText:\n${text}`,
  continue: (text) =>
    `Continue the following text in a way that is consistent with the style and tone of the original text. Return plain text only. Continue naturally from the provided text.\n\nText:\n${text}`,
};

export const runAiAssist = async ({ action, text, stream = false }) => {
  if (!text || !text.trim()) {
    throw new Error("Text is required for AI assist");
  }

  if (action === "grammar") {
    const result = await checkGrammar(text);
    return result;
  }

  const promptBuilder = actionPrompts[action];
  if (!promptBuilder) {
    throw new Error("Unsupported AI action");
  }

  try {
    const result = await generateContentWithFallback(
      promptBuilder(text),
      stream,
    );

    // If streaming, return the stream object directly
    if (stream) return result;

    let suggestion = result;
    // Clean up markdown code blocks if the AI ignored the instruction (only for static strings)
    if (suggestion.startsWith("```")) {
      suggestion = suggestion.replace(/^```[a-z]*\n?|```$/gi, "").trim();
    }

    return {
      action,
      suggestion,
      original: text,
      errors: [],
    };
  } catch (error) {
    console.error("AI Service Error:", error.message);
    throw error;
  }
};

export const chatWithAi = async ({
  message,
  history = [],
  summary = "",
  noteContext = "",
  webContext = "",
  imageBase64 = null,
  stream = false,
}) => {
  ensureAiApiKey(); // Only requires Gemini or OpenRouter — Groq is a fallback, not a prerequisite

  let finalMessage = message;
  let finalImageBase64 = imageBase64;

  if (imageBase64?.startsWith("data:application/pdf")) {
    try {
      const base64Data = imageBase64.split(",")[1];
      const pdfBuffer = Buffer.from(base64Data, "base64");

      const parser = new PDFParse({ data: pdfBuffer });
      const pdfData = await parser.getText();
      const pdfText = pdfData.text.trim();
      await parser.destroy();

      finalMessage = `[Attached PDF Document]\n${pdfText}\n\n${message || "Please review this document."}`;
      finalImageBase64 = null; // Clear it so it isn't treated as a vision image
    } catch (err) {
      console.error("PDF Parsing Error:", err);
      throw new Error("Failed to read the attached PDF document.");
    }
  }

  if (!finalMessage?.trim() && !finalImageBase64) {
    throw new Error("Message or Image/PDF is required for AI assist");
  }

  if (history.length > 20) {
    try {
      // Only summarize the middle part if it's huge, or just the whole thing if it's manageable
      // But let's at least ensure we don't send 100+ messages to the summarizer
      const summarizationInput = history.length > 40 ? history.slice(-40) : history;
      summary = await summarizeHistory(summarizationInput);
      history = history.slice(-5);
      console.log("📝 New summary generated");
    } catch (err) {
      console.error("⚠️ Summarization failed, proceeding without new summary:", err.message);
      // Don't crash the whole chat just because summarization failed
      history = history.slice(-10); // Trim anyway to keep context window safe
    }
  }

  const trimmedHistory = history.slice(-6);
  const safeWebContext = webContext?.slice(0, 10000);
  const safeNoteContext = noteContext?.slice(0, 8000);
  console.log(
    "🧠 Context: Web:",
    webContext?.length || 0,
    "Note:",
    noteContext?.length || 0,
  );

  const webBlock = safeWebContext
    ? [
        "IMPORTANT: The following are REAL-TIME WEB SEARCH RESULTS.",
        "Prioritize this information for current events, tech updates, and factual queries.",
        `\n--- WEB SEARCH RESULTS ---\n${safeWebContext}\n--- END WEB RESULTS ---`,
      ].join("\n")
    : null;

  const noteBlock = safeNoteContext
    ? [
        "IMPORTANT: The following is the content of the user's current note.",
        "Use this for context about what the user is working on.",
        `\n--- USER'S NOTE ---\n${safeNoteContext}\n--- END OF NOTE ---`,
      ].join("\n")
    : null;

  const basePrompt = finalImageBase64
    ? QWEN_VISION_PROMPT
    : buildIrisPrompt({
        message: finalMessage,
        hasNote: !!safeNoteContext,
        hasWeb:  !!safeWebContext,
        isVision: false,
      });

  const combinedSystemPrompt = [
    basePrompt,
    webBlock, // Web data first for fact priority
    noteBlock,
    summary && `Conversation summary:\n${summary}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const reply = await getAiReply(
    finalMessage,
    finalImageBase64,
    combinedSystemPrompt,
    trimmedHistory,
    stream,
  );

  if (stream) {
    // Fallback models (Groq, NVIDIA) return a plain string — not a ReadableStream.
    // Wrap it so the controller's `for await (chunk of result)` loop works uniformly.
    let streamResponse = reply;
    if (typeof reply === "string") {
      const encoder = new TextEncoder();
      const sseChunk = `data: ${JSON.stringify({ choices: [{ delta: { content: reply } }] })}\n\ndata: [DONE]\n\n`;
      streamResponse = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(sseChunk));
          controller.close();
        },
      });
    }

    return {
      stream: streamResponse,
      summary,
    };
  }

  const segments = parseIrisResponse(reply);

  return {
    toolUsed: null,
    reply,
    segments,
    summary, // Return the summary (old or new)
    history: [
      ...trimmedHistory,
      { role: "user", content: message },
      { role: "assistant", content: reply },
    ],
  };
};

export const generateTitle = async (text) => {
  const prompt = `Generate a short, descriptive 4-6 word title for the following content.
Return only the title. No quotes, no punctuation at the end, no explanations.
Content:
${text.slice(0, 500)}`;

  return await generateContentWithFallback(prompt);
};

export const getDynamicPrompts = async () => {
  try {
    const allPrompts = await Prompt.find({ isActive: true }).sort({
      priority: -1,
    });

    return {
      studentPrompts: allPrompts
        .filter((p) => p.category === "student")
        .map((p) => p.text),
      devPrompts: allPrompts
        .filter((p) => p.category === "developer")
        .map((p) => p.text),
    };
  } catch (error) {
    console.error("Failed to fetch prompts from DB, using fallback:", error);
    return { studentPrompts: [], devPrompts: [] };
  }
};


// ─── PROMPT SECTIONS (each is a self-contained string) ───────────────────────
// Base: always included. ~130 tokens.
const P_CORE = `You are Iris, Notesify's AI learning assistant. Today: ${new Date().toDateString()}.
Speak in first person. Be clear and concise. Return final answers only — no planning or meta-commentary.
Formatting: Markdown, \`\`\`code fences\`\`\`, \`inline code\`, $math$ / $$math$$ delimiters. No long paragraphs.
In your thinking, focus only on the subject matter — do not narrate formatting decisions or response structure.`;

// Teaching: add when note context or study-related message. ~40 tokens.
const P_TEACHING = `Teaching: break concepts into steps, use examples, highlight key takeaways 👉, admit uncertainty.`;

// VIZ: add when message suggests diagrams, flowcharts, or formulas. ~70 tokens.
const P_VIZ = `Visualizations (use sparingly, only when it genuinely helps):
[IRIS_VIZ type="mermaid|chart|math" title="Title"]content[/IRIS_VIZ]
mermaid=flowcharts, chart=JSON data, math=LaTeX. Do NOT overuse.`;

// CLARIFY: always add when teaching — lets Iris ask one focused question before explaining. ~35 tokens.
const P_CLARIFY = `If the request is broad or ambiguous, ask ONE clarifying question first using:
[IRIS_ASK prompt="Your question?"]
A) Option A
B) Option B
C) Option C
[/IRIS_ASK]
Only do this when it genuinely helps. Skip for simple/clear requests.`;

// QUIZ: add only when user explicitly asks to be tested. ~70 tokens.
const P_QUIZ = `For quizzes, use chained [IRIS_ASK] blocks (one per question, revealed sequentially):
[IRIS_ASK prompt="Question?"]
A) option
B) option
C) option
D) option
[/IRIS_ASK]
Follow each answered question with brief feedback, then the next block.`;

// ─── DYNAMIC PROMPT BUILDER ───────────────────────────────────────────────────
const buildIrisPrompt = ({ message = "", hasNote = false, hasWeb = false, isVision = false }) => {
  const msg = message.toLowerCase();

  const wantsQuiz  = /quiz|ask me|test me|mcq/.test(msg);
  const wantsViz   = /diagram|flowchart|chart|graph|formula|equation|visuali/.test(msg) || hasNote;
  const wantsTeach = hasNote || hasWeb || /explain|teach|how does|what is|summarize|learn|understand/.test(msg);

  const parts = [P_CORE];
  if (wantsTeach) parts.push(P_TEACHING, P_CLARIFY); // teaching context → clarify is available
  if (wantsViz)   parts.push(P_VIZ);
  if (wantsQuiz)  parts.push(P_QUIZ);                // explicit quiz request → full quiz format

  return parts.join("\n\n");
};


// Legacy constant kept for the vision model path (short, no tool instructions needed)
const QWEN_VISION_PROMPT = `You are Iris, Notesify's AI assistant. Today: ${new Date().toDateString()}.
Use Markdown, \`\`\`code fences\`\`\`, $math$ delimiters. Be concise and accurate.`;

