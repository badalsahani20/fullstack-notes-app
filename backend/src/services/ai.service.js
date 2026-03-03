import { diffWords } from "diff";
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const checkGrammar = async (text) => {
    // Add a backup check for the API key to prevent a silent fail
    console.log("DEBUG: Key exists?", !!process.env.GEMINI_API_KEY);
console.log("DEBUG: Key Prefix:", process.env.GEMINI_API_KEY?.substring(0, 7));
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from environment variables");
    }

    const prompt = `You are a professional editor. Fix the grammar, spelling, and punctuation in the following text. 
    Return ONLY the corrected text without any explanations or extra words: "${text}"`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const correctedText = response.text().trim();

        const differences = diffWords(text, correctedText);
        const errorCoordinates = mapDiffsToError(differences);

        return {
            original: text,
            corrected: correctedText,
            errors: errorCoordinates,
        };
    } catch (error) {
        console.error("Gemini Service Error: ", error.message);
        throw error;
    }
};

export const mapDiffsToError = (diffs) => {
    let currPos = 0;
    const errors = [];

    diffs.forEach((part, index) => {
        if(part.removed) {
            const nextPart = diffs[index + 1];
            const suggestion = (nextPart && nextPart.added) ? nextPart.value : null;

            errors.push({
                start: currPos,
                end: currPos + part.value.length,
                original: part.value,
                suggestion: suggestion
            });

            currPos += part.value.length;
        }
        else if(part.added) {
            const prevPart = diffs[index - 1];
            if(!prevPart || !prevPart.removed) {
                errors.push({ start: currPos, end: currPos, original: "", suggestion: part.value })
            }
        }else{
            currPos += part.value.length;
        }
    });

    return errors;
}