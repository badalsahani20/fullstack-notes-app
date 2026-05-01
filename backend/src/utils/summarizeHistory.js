import { client } from "./groqClient.js";

export const summarizeHistory = async (history) => {
  if (!client?.chat?.completions) {
    throw new Error("Groq client not properly initialized for summarization. Check GROQ_API_KEY.");
  }

  // Optimize history payload to stay under TPM/Token limits
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
          "You are a summarizer. Create a short summary (under 100 words) of the conversation so far. Focus on the main topics and any specific requests the user has made.",
      },
      { role: "user", content: compactHistory },
    ],
  });

  return response.choices[0].message.content.trim();
};
