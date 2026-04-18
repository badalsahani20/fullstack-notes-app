import { client } from "./groqClient.js";

export const summarizeHistory = async (history) => {
  if (!client?.chat?.completions) {
    throw new Error("Groq client not properly initialized for summarization. Check GROQ_API_KEY.");
  }
  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "You are a summarizer. Create a short summary of the conversation so far. Keep it concise but include important context.",
      },
      { role: "user", content: JSON.stringify(history) },
    ],
  });

  return response.choices[0].message.content.trim();
};
