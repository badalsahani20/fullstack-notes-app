import { diffWords } from "diff";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { mapDiffsToError } from "../utils/mapDiffsToError.js";
import { client } from "../utils/groqClient.js";
import { summarizeHistory } from "../utils/summarizeHistory.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const NOTE_CONTEXT_PREFIX = "__NOTE_CONTEXT__:";

const ensureGeminiApiKey = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(`GEMINI api key is missing from environment variables`);
  }
};

const ensureGroqApiKey = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ api key is missing from environment variables");
  }
};

export const checkGrammar = async (text) => {
  ensureGeminiApiKey();

  const prompt = `You are a professional editor. Fix grammar, spelling, punctuation, and awkward phrasing while preserving meaning. Return only corrected text.\n\nText:\n${text}`;

  try {
    const result = await model.generateContent(prompt);
    const correctedText = result.response.text().trim();

    const differences = diffWords(text, correctedText);
    const errorCoordinates = mapDiffsToError(differences);

    return {
      original: text,
      corrected: correctedText,
      errors: errorCoordinates,
    };
  } catch (error) {
    console.error("Gemini Service Error:", error.message);
    throw error;
  }
};

const actionPrompts = {
  summarize: (text) =>
    `Summarize the following note in concise bullet points. Keep important facts and action items. Return plain text only.\n\nNote:\n${text}`,
  explain: (text) =>
    `Explain the following note in simpler language for a beginner. Keep it accurate and clear. Return plain text only.\n\nNote:\n${text}`,
  rewrite: (text) =>
    `Rewrite the following text to improve clarity, flow, and grammar while preserving meaning. Return plain text only.\n\nText:\n${text}`,
};

export const runAiAssist = async ({ action, text }) => {
  ensureGeminiApiKey();

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
    const result = await model.generateContent(promptBuilder(text));
    const suggestion = result.response.text().trim();

    return {
      action,
      suggestion,
      original: text,
      errors: [],
    };
  } catch (error) {
    console.error("Gemini Service Error:", error.message);
    throw error;
  }
};

export const chatWithAi = async ({
  message,
  history = [],
  summary = "",
  noteContext = "",
}) => {
  ensureGroqApiKey();

  if (!message || !message.trim()) {
    throw new Error("Message is required for AI assist");
  }

  if (history.length > 20 && !summary) {
    summary = await summarizeHistory(history);
    history = history.slice(-5);
  }

  const trimmedHistory = history.slice(-6);
  const safeContext = noteContext?.slice(0, 1500);
  const messages = [
    {
      role: "system",
      content: `
You are Iris, an expert AI assistant integrated into Notesify, a professional note-taking application built by Badal Sahani. Your primary goal is to help the user synthesize, improve, and understand their notes.

Core Directives:
- Be concise and highly structured. Use bullet points and bold text for readability.
- When explaining technical concepts, Data Structures, Algorithms, or full-stack code (like Java, React, or SQL), prioritize clarity and provide brief, accurate code snippets if relevant.
- Always assume the context of the conversation is related to the user's current active note unless stated otherwise.
- Never output markdown headers (like # or ##) that will clash with the user's existing document structure.
- If asked to rewrite text, maintain the user's original technical accuracy but improve the flow.
`,
    },
    safeContext && {
      role: "system",
      content: `Relevant content from the user's note:\n ${safeContext}`,
    },
    summary && {
      role: "system",
      content: `Conversation summary: \n${summary}`,
    },
    ...trimmedHistory,
    { role: "user", content: message },
  ].filter(Boolean);
  try {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
    });

    const reply = response.choices[0].message.content;

    return {
      reply,
      history: [
        ...trimmedHistory,
        { role: "user", content: message },
        { role: "assistant", content: reply },
      ],
    };
  } catch (error) {
    throw new Error(`Groq Chat Error: ${error.message}`);
  }
};
