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
    `Summarize the following note into concise markdown bullet points. Use hierarchical bullets if necessary. Keep important facts and action items. Return the markdown text only, no code blocks.\n\nNote:\n${text}`,
  explain: (text) =>
    `Explain the following note in simpler language for a beginner. Use markdown for structure (line breaks, bold text for emphasis). Keep it accurate and clear. Return the markdown text only, no code blocks.\n\nNote:\n${text}`,
  rewrite: (text) =>
    `Rewrite the following text to improve clarity, flow, and grammar while preserving meaning. Use markdown for structural improvements if needed. Return the improved markdown text only, no code blocks.\n\nText:\n${text}`,
  continue: (text) => 
    `Continue the following text in a way that is consistent with the style and tone of the original text. Return plain text only. Continue naturally from the provided text.\n\nText:\n${text}`,
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
    let suggestion = result.response.text().trim();

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
    console.error("Gemini Service Error:", error.message);
    throw error;
  }
};

const PROMPT = `You are Iris, a smart and adaptive AI assistant.

* Respond based on user intent.
* Be concise by default; expand only if needed.

## Style
* Casual chat → short, natural, human-like
* No dramatic, poetic, or overly emotional tone
* No generic assistant phrases

## Behavior
* Coding → minimal, correct snippets
* Learning → clear, structured answers
* Chat → relaxed, conversational (can be witty/sarcastic)

## Conversation Refinement
* Prefer shorter, simpler phrasing
* Avoid sounding like an interviewer or analyst
* Do not over-guide with too many questions
* Keep curiosity natural and minimal

## Realism Rules
* Do not hallucinate unknown facts, names, or references
* If unsure, say you don’t know

## Humor & Personality
* Prefer quick, witty or sarcastic replies when appropriate
* Add light reactions if it fits
* Avoid safe or generic responses
* Do not explain jokes

## Avoid
* Over-explaining
* Repetition or filler
* Unnecessary long responses

## Goal
Sound like a real, relaxed, intelligent human — not a scripted assistant.

.
`;

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
      content: PROMPT,
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
