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

const PRIMARY_MODEL = "deepseek/deepseek-v4-flash";
// const PRIMARY_MODEL = "qwen/qwen3.5-flash-02-23";
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

const executeOpenRouter = async (modelId, messages, stream = false, includeReasoning = true) => {
  const isQwenModel = modelId.toLowerCase().includes("qwen");
  const apiKey = (isQwenModel && process.env.QWEN_API) ? process.env.QWEN_API : process.env.OPEN_ROUTER;

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

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.BACKEND_URL || "http://localhost:5500",
        "X-Title": "Notesify AI Assistant",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyPayload),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `OpenRouter returned ${response.status}: ${JSON.stringify(errorData)}`,
    );
  }

  //If streaming return the raw response body
  if (stream) return response.body;

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) throw new Error(`OpenRouter (${modelId}) returned no content`);

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

  // 1. Prepare message for Qwen (Multimodal Primary)
  const qwenMessages = [
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
    const activeModel = imageBase64 ? "qwen/qwen3.5-flash-02-23" : PRIMARY_MODEL;
    const useReasoning = !imageBase64; // Disable reasoning when using the vision model
    
    const reply = await executeOpenRouter(activeModel, qwenMessages, stream, useReasoning);
    console.log(`🤖 Chat answered by ${activeModel} (Reasoning: ${useReasoning})`);
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

  if (history.length > 20 && !summary) {
    summary = await summarizeHistory(history);
    history = history.slice(-5);
  }

  const trimmedHistory = history.slice(-6);
  const safeContext = noteContext?.slice(0, 8000);
  console.log("🧠 Context Size ", noteContext.length || 0, "chars");

  const noteBlock = safeContext
    ? [
        "IMPORTANT: The user's note content is already provided below.",
        "Do NOT ask the user to share or paste their note — you already have it.",
        `\n--- USER'S NOTE ---\n${safeContext}\n--- END OF NOTE ---`,
      ].join("\n")
    : null;

  const basePrompt = finalImageBase64 ? QWEN_VISION_PROMPT : PROMPT;

  const combinedSystemPrompt = [
    basePrompt,
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
    if (typeof reply === "string") {
      const encoder = new TextEncoder();
      const sseChunk = `data: ${JSON.stringify({ choices: [{ delta: { content: reply } }] })}\n\ndata: [DONE]\n\n`;
      return new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(sseChunk));
          controller.close();
        },
      });
    }
    return reply; // ReadableStream from OpenRouter — pipe as-is
  }

  const segments = parseIrisResponse(reply);

  return {
    toolUsed: null,
    reply,
    segments,
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

const QWEN_VISION_PROMPT = `You are Qwen3.5-Flash, a large language model from Qwen. Today's date is ${new Date().toDateString()}.

Formatting Rules:
- Use Markdown for lists, tables, and styling.
- Use \`\`\`code fences\`\`\` for all code blocks.
- Format file names, paths, and function names with \`inline code\` backticks.
- **For all mathematical expressions, you must use dollar-sign delimiters. Use $...$ for inline math and $$...$$ for block math. Do not use (...) or [...] delimiters.**
`;

const PROMPT = `
Today is ${new Date().toDateString()}.

Your name is Iris. You are an AI learning assistant in Notesify.
IMPORTANT IDENTITY RULE: Do not refer to yourself in the third person in your thoughts (e.g., do not say "I need to respond as Iris"). You ARE Iris. Think and speak entirely in the first person.

Be clear, helpful, and practical. Teach simply.

## Output Rules
- Do NOT show thinking, analysis, or planning.
- Only return the final answer.
- Keep responses concise unless more detail is needed.
- Avoid unnecessary verbosity.

## Formatting
- Use Markdown (lists, tables, emphasis).
- Use \`\`\`language code fences\`\`\` for code.
- Use \`inline code\` for file names, paths, functions.
- Use $...$ or $$...$$ for math.
- Use emojis only when helpful (✅ ❌ 💡 👉 🧠 ⚠️).
- Avoid long paragraphs.

## Teaching Style
- Break concepts into simple steps.
- Use examples or analogies if useful.
- Highlight key takeaways 👉
- If unsure, say so.

## Visualization (use sparingly)
Use only when it improves understanding:

[IRIS_VIZ type="TYPE" title="TITLE"]
content
[/IRIS_VIZ]

Types:
- mermaid → simple flowcharts (flowchart TD, clear nodes)
- chart → real data only (JSON format)
- math → LaTeX

Do NOT overuse visualizations.
`;