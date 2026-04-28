import type { IrisSegment } from "@/store/useGlobalChatStore";

/**
 * Parses raw AI response text into structured segments.
 * Detects IRIS_VIZ blocks for visualizations (Mermaid, Charts, Math).
 */
export const parseIrisResponse = (text: string): IrisSegment[] => {
  const segments: IrisSegment[] = [];
  
  // Supports both formats the model may emit:
  //   New (attribute): [IRIS_VIZ type="mermaid" title="My Title"]...content...[/IRIS_VIZ]
  //   Old (colon):     [IRIS_VIZ:mermaid:My Title]...content...[/IRIS_VIZ]
  const vizRegex =
    /\[IRIS_VIZ(?:\s+type=["']?(mermaid|chart|math)["']?\s+title=["']?([^"'\]]*)["']?|:(mermaid|chart|math):([^\]])*)\]([\s\S]*?)\[\/IRIS_VIZ\]/gi;
  
  let lastIndex = 0;
  let match;

  while ((match = vizRegex.exec(text)) !== null) {
    // Group layout: [1]=type(attr), [2]=title(attr), [3]=type(colon), [4]=title(colon), [5]=data
    const type  = (match[1] || match[3] || "").toLowerCase() as "mermaid" | "chart" | "math";
    const title = (match[2] || match[4] || "").trim();
    const data  = match[5];

    // 1. Add preceding text segment if it exists
    const precedingText = text.slice(lastIndex, match.index).trim();
    if (precedingText) {
      segments.push({ kind: "text", content: precedingText });
    }

    // 2. Add the visualization segment
    if (type && data !== undefined) {
      segments.push({
        kind: "viz",
        type,
        title: title || "Visualization",
        data: data.trim(),
      });
    }

    lastIndex = vizRegex.lastIndex;
  }

  // 3. Add remaining text segment if it exists
  const remainingText = text.slice(lastIndex).trim();
  if (remainingText || segments.length === 0) {
    segments.push({
      kind: "text",
      content: remainingText || text,
    });
  }

  return segments;
};
