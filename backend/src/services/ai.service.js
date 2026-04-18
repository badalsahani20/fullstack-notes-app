import { diffWords } from "diff";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { mapDiffsToError } from "../utils/mapDiffsToError.js";
import { client } from "../utils/groqClient.js";
import { summarizeHistory } from "../utils/summarizeHistory.js";
import { OpenRouter } from '@openrouter/sdk';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
const NOTE_CONTEXT_PREFIX = "__NOTE_CONTEXT__:";

const ensureAiApiKey = () => {
  if (!process.env.GEMINI_API_KEY && !process.env.OPEN_ROUTER) {
    throw new Error(`Both GEMINI and OPENROUTER api keys are missing from environment variables`);
  }
};

const ensureGroqApiKey = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ api key is missing from environment variables");
  }
};

// Helper: Tries Gemini first, falls back to OpenRouter if Gemini fails or is missing
const generateContentWithFallback = async (prompt) => {
  ensureAiApiKey();

  // Try Gemini first if key exists
  if (process.env.GEMINI_API_KEY) {
    try {
      const result = await model.generateContent(prompt);
      console.log("💎 Action answered by Gemini 3.1 Flash Lite");
      return result.response.text().trim();
    } catch (error) {
      console.warn("Gemini Error, falling back to OpenRouter:", error.message);
      if (!process.env.OPEN_ROUTER) throw error;
    }
  }

  // Fallback to OpenRouter using direct fetch (reliable fallback)
  if (process.env.OPEN_ROUTER) {
    const openRouter = new OpenRouter({
      apiKey: process.env.OPEN_ROUTER,
    });

    const completion = await openRouter.chat.send({
      httpReferer: process.env.BACKEND_URL || 'http://localhost:5000',
      appTitle: 'Notesify',
      chatRequest: {
        model: "meta-llama/llama-3.1-8b-instruct", // Using free, high-speed LLaMA 3 for free fallback
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      },
    });

    const content = completion?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("OpenRouter returned an empty response");
    }

    return content.trim();
  }

  throw new Error("No AI feature keys configured");
};

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

export const runAiAssist = async ({ action, text }) => {
  if (!text || !text.trim()) {
    throw new Error("Text is required for AI assist");
  }

  if (action === "grammar") {
    const result = await checkGrammar(text);
    return {
      action,
      suggestion: result.corrected,
      errors: result.errors,
      original: result.original,
    };
  }

  const promptBuilder = actionPrompts[action];
  if (!promptBuilder) {
    throw new Error("Unsupported AI action");
  }

  try {
    let suggestion = await generateContentWithFallback(promptBuilder(text));

    // Clean up markdown code blocks if the AI ignored the instruction
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

const PROMPT = `You are Iris, an advanced AI learning assistant integrated into Notesify, a premium note-taking and learning platform.

## Your Core Role
* You act as a highly intelligent, encouraging, and deeply knowledgeable tutor.
* Your primary goal is to help the user learn faster, understand complex topics, and organize their thoughts brilliantly.
* Always actively consider the context of the user's current notes when answering.

## Communication & Aesthetic Style (CRITICAL)
* Be extremely clear, pedagogical, and structured.
* Use emojis to make the content visual and engaging (e.g., 🚨, ✅, ❌, 👉, 🧠, 💡, 🔍, ⚠️) — but use them purposefully, not excessively.
* Keep a warm, encouraging, but professional tone.

## Formatting Rules (FOLLOW STRICTLY)
* **Headings**: Use ## or ### for section titles — never # (too large in chat).
* **Tables**: Use markdown tables whenever comparing things, listing pros/cons, summarizing multiple items, or showing structured data side-by-side. Example:
  | Feature | Option A | Option B |
  |---------|----------|----------|
  | Speed   | Fast     | Slow     |
* **Section dividers**: Use --- (horizontal rule) between distinct major sections of a response to visually separate them.
* **Bullet lists**: Use for step-by-step breakdowns or feature lists.
* **Code**: Always use fenced code blocks with language tags.
* **Never** respond with massive walls of unformatted text. Keep paragraphs punchy and scannable.

## Educational Guidelines
* When explaining a complex concept, break it down step-by-step with simple analogies.
* Use ✅/❌ for pros/cons or diagnostics. Use 👉 for key takeaways.
* When summarizing notes, pull out the most actionable insights.
* Do not hallucinate. If unsure, say so and suggest how the user can research it.
* When appropriate, suggest how they might organize their ideas in their notes.`;


export const chatWithAi = async ({
  message,
  history = [],
  summary = "",
  noteContext = "",
  imageBase64 = null
}) => {
  ensureGroqApiKey();

  if ((!message || !message.trim()) && !imageBase64) {
    throw new Error("Message or Image is required for AI assist");
  }

  if (history.length > 20 && !summary) {
    summary = await summarizeHistory(history);
    history = history.slice(-5);
  }

  const trimmedHistory = history.slice(-6);
  const safeContext = noteContext?.slice(0, 1500);

  // Combine all system rules into ONE message to prevent Nvidia 400 Error (Gemma strictly demands alternating formats)
  const combinedSystemPrompt = [
    PROMPT,
    safeContext && `Relevant content from the user's note:\n ${safeContext}`,
    summary && `Conversation summary: \n${summary}`
  ].filter(Boolean).join("\n\n---\n\n");

  // 1. Build the base system messages
  const baseMessages = [
    { role: "system", content: combinedSystemPrompt },
    ...trimmedHistory,
  ].filter(Boolean);

  // 2. Build the NVIDIA-specific User Prompt (Handles Image tag if it exists)
  const nvidiaUserContent = imageBase64 ? [
  { 
    type: "text", 
    text: `[System Directive: Provide a highly detailed description of what you see in the attached image, then answer the user's prompt.]\n\nUser prompt: ${message}` 
  },
  { 
    type: "image_url", 
    image_url: { 
      url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` 
    } 
  }
] : message;

  // 3. Build the GROQ-specific User Prompt (Strictly Text Only)
  const groqUserContent = imageBase64 
    ? `${message}\n\n[System Note: The user attached an image, but this model cannot view images. Please politely inform them you can only read text.]` 
    : message;

  const groqMessages = [
    ...baseMessages,
    { role: "user", content: groqUserContent }
  ];

  /* --- EXECUTION --- */

  const executeNvidia = async () => {
    if (!process.env.NVIDIA_API_KEY) throw new Error("No NVIDIA API Key");
    
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemma-2-9b-it",
        messages: [...baseMessages, { role: "user", content: nvidiaUserContent }],
        stream: false,
        max_tokens: 1024,
      })
    });

    if (!response.ok) throw new Error(`NVIDIA returned ${response.status}`);

    const data = await response.json();
    console.log("✅ Chat answered by NVIDIA Gemma 3!");
    return data.choices[0].message.content;
  };

  const executeGroq = async () => {
    if (!client?.chat?.completions) {
      throw new Error("Groq client not properly initialized. Check GROQ_API_KEY.");
    }
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: groqMessages,
    });
    console.log("⚡ Chat answered by GROQ Llama 70B!");
    return response.choices[0].message.content;
  };

  let reply = "";

  // Dynamic Routing
  if (imageBase64) {
    // 📸 IMAGE PAYLOAD: Nvidia Primary -> Groq Text-Only Fallback
    try {
      reply = await executeNvidia();
    } catch (error) {
      console.warn("Nvidia Vision Failed, falling back to Groq text-only:", error.message);
      reply = await executeGroq();
    }
  } else {
    // 📝 TEXT PAYLOAD: Groq Primary (Lightning Fast) -> Nvidia Fallback
    try {
      reply = await executeGroq();
    } catch (error) {
      console.warn("Groq Text Failed, falling back to Nvidia:", error.message);
      reply = await executeNvidia();
    }
  }

  return {
    reply,
    history: [...trimmedHistory, { role: "user", content: message }, { role: "assistant", content: reply }],
  };
};

export const generateTitle = async (text) => {
  const prompt = `Generate a short, descriptive 4-6 word title for the following content.
Return only the title. No quotes, no punctuation at the end, no explanations.
Content:
${text.slice(0, 500)}`; // cap at 500 chars, we don't need more for a title

return await generateContentWithFallback(prompt);
}
