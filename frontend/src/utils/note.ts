export function extractTitle(html: string): string {
    const match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if(!match) return "Untitled";
    return match[1].replace(/<[^>]+>/g, "").trim() || "Untitled";
}

export function extractPreview(html: string, limit: number): string {
    const text = html
        .replace(/<h1[^>]*>.*?<\/h1>/i, "")
        .replace(/<[^>]+>/g, "")
        .trim();
    return text.slice(0, limit) + (text.length > limit ? "..." : "");
}