export const generateEmbedding = async (text) => { 
    try{
        const apiKey = process.env.OPEN_ROUTER || process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API;
        if (!apiKey) throw new Error("No OpenRouter API key found for embeddings");

        const response = await fetch(`https://openrouter.ai/api/v1/embeddings`,{
            method: "POST",
            headers:{
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model:"thenlper/gte-base",
                input: text,
            })
        });
        const data = await response.json();
        return data.data ? data.data[0].embedding : null;
    }catch(err){
        console.log("Error generating embedding: ", err);
        return null;
    }
} 