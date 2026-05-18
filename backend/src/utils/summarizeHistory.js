import { client } from "./groqClient.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const summarizeHistory = async (history) => {
  // --- PREFERRED: Gemini Flash (1M TPM free tier) ---
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3.1-flash-lite",
        systemInstruction: "You are an expert summarizer. Create a comprehensive but concise summary of the conversation so far. Focus on core context, technical decisions, and ongoing tasks. Keep it detailed enough to preserve context but under 400 words.",
        generationConfig: {
          thinking_config: { thinking_level: "minimal" },
        }
      });
      
      const fullHistoryStr = history
        .map((m) => {
          const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
          return `${m.role.toUpperCase()}: ${content}`;
        })
        .join("\n\n");

      const prompt = `Conversation:\n${fullHistoryStr}`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      console.warn("⚠️ Gemini summarization failed, falling back to Groq:", err.message);
      // Fall through to Groq if Gemini fails
    }
  }

  // --- FALLBACK: Groq (Strict 6,000 TPM limit on free tier) ---
  if (!client?.chat?.completions) {
    throw new Error("Groq client not properly initialized for summarization. Check GROQ_API_KEY.");
  }

  // Optimize history payload to stay under Groq TPM limits
  const compactHistory = history
    .slice(-15) // Only summarize the last 15 messages for context
    .map((m) => {
      const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
      // Truncate individual long messages to 500 chars to save tokens
      const truncated = content.length > 500 ? content.slice(0, 500) + "..." : content;
      return `${m.role.toUpperCase()}: ${truncated}`;
    })
    .join("\n\n");

  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "You are an expert summarizer. Create a comprehensive but concise summary of the conversation so far. Focus on core context, technical decisions, and ongoing tasks. Keep it detailed enough to preserve context but under 400 words.",
      },
      { role: "user", content: compactHistory },
    ],
  });

  return response.choices[0].message.content.trim();
};
