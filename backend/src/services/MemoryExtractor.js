import { executeOpenRouter, QUICK_MODEL } from "../services/ai.service.js";

const EXTRACTION_PROMPT = `You are a strict, objective memory extraction system.
Review the following chat session between a User and an Assistant.
Extract only stable, long-term information explicitly stated by the user.

Categories allowed: "PROFILE", "PREFERENCE", "GOAL", "PROJECT", "SKILL", "OTHER".

RULES:
1. Extract explicit facts (e.g., "I am learning Java" -> SKILL: "User is learning Java").
2. Extract explicit preferences (e.g., "I love backend development" -> PREFERENCE: "User loves backend development").
3. DO NOT infer or assume things not explicitly stated.
4. Ignore temporary thoughts, one-off tasks, or speculation.
5. Provide a 1-2 sentence high-level summary of the session.

Return ONLY a valid JSON object matching this schema exactly:
{
  "summary": "Session summary...",
  "memories": [
    { "category": "SKILL", "content": "User is learning Java" }
  ]
}`;

export const extractMemories = async (messages) => {
    if (!messages || messages.length === 0) return { summary: "", memories: [] };

    try {
        const transcript = messages
            .map(m => `${m.role.toUpperCase()}: ${m.content}`)
            .join("\n\n");

        const responseText = await executeOpenRouter(
            QUICK_MODEL,
            [
                { role: "system", content: EXTRACTION_PROMPT },
                { role: "user", content: transcript }
            ],
            false, // no stream
            false, // no reasoning
            2000
        );

        // Strip Markdown formatting if the model wrapped it in ```json ... ```
        const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        
        const data = JSON.parse(cleanJson);
        return {
            summary: data.summary || "",
            memories: Array.isArray(data.memories) ? data.memories : []
        };
    } catch (err) {
        console.error("Error extracting memories:", err);
        return { summary: "", memories: [] };
    }
};