import { stripHtml } from "./stripHtml";

export function extractTitle(html: string): string {
    const match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if(!match) return "Untitled";
    return stripHtml(match[1]) || "Untitled";
}

export function extractPreview(html: string, limit: number): string {
    const text = stripHtml(html.replace(/<h1[^>]*>.*?<\/h1>/i, ""));
    return text.slice(0, limit) + (text.length > limit ? "..." : "");
}

