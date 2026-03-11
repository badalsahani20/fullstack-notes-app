import { diffWords } from "diff";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const ensureApiKey = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from environment variables");
  }
};

export const mapDiffsToError = (diffs) => {
  let currPos = 0;
  const errors = [];

  diffs.forEach((part, index) => {
    if (part.removed) {
      const nextPart = diffs[index + 1];
      const suggestion = nextPart && nextPart.added ? nextPart.value : null;

      errors.push({
        start: currPos,
        end: currPos + part.value.length,
        original: part.value,
        suggestion,
      });

      currPos += part.value.length;
    } else if (part.added) {
      const prevPart = diffs[index - 1];
      if (!prevPart || !prevPart.removed) {
        errors.push({ start: currPos, end: currPos, original: "", suggestion: part.value });
      }
    } else {
      currPos += part.value.length;
    }
  });

  return errors;
};

export const checkGrammar = async (text) => {
  ensureApiKey();

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
  ensureApiKey();

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
