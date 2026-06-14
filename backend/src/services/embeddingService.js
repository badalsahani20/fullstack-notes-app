export const generateEmbedding = async (text) => { 
    try{
        const response = await fetch(`https://openrouter.ai/api/v1/embeddings`,{
            method: "POST",
            headers:{
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
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