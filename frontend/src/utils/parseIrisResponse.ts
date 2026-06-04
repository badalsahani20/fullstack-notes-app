import type { IrisSegment } from "@/store/useGlobalChatStore";

/**
 * Parses raw AI response text into structured segments.
 *
 * Supported block types:
 *
 * ── IRIS_VIZ (attribute format):
 *   [IRIS_VIZ type="mermaid" title="My Title"]...data...[/IRIS_VIZ]
 *   [IRIS_VIZ:mermaid:My Title]...data...[/IRIS_VIZ]   (legacy colon format)
 *
 * ── IRIS_ASK (clarify or MCQ):
 *   [IRIS_ASK prompt="Question?"]
 *   A) Option 1
 *   B) Option 2
 *   [/IRIS_ASK]
 *
 *   [IRIS_ASK type="clarify" prompt="Question?" options="Yes,No,Maybe"][/IRIS_ASK]
 *
 * Multiple IRIS_ASK blocks are parsed in order and rendered sequentially
 * by IrisMessageBody (one revealed after the previous is answered).
 */
export const parseIrisResponse = (text: string): IrisSegment[] => {
  // Collect all blocks with their text positions so we can sort and interleave
  const blocks: Array<{ start: number; end: number; segment: IrisSegment }> = [];

  // ── IRIS_VIZ ────────────────────────────────────────────────────────────────
  // Also accept "xychart-beta" as a type (model sometimes confuses the Mermaid
  // diagram subtype with the IRIS_VIZ type attribute). Normalised to "mermaid".
  const vizRegex =
    /\[(?:IRIS_VIZ|\/IRIS_VIZ(?=\s|:))(?:\s+type=["']?(mermaid|chart|math|xychart-beta)["']?\s+title=["']?([^"'\]]*)['"']?|:(mermaid|chart|math):([^\]]*))\]([\s\S]*?)\[\/IRIS_VIZ\]/gi;

  let m: RegExpExecArray | null;
  while ((m = vizRegex.exec(text)) !== null) {
    const rawType = (m[1] || m[3] || "").toLowerCase();
    // Normalise xychart-beta → mermaid so the renderer picks it up correctly
    const type = (rawType === "xychart-beta" ? "mermaid" : rawType) as "mermaid" | "chart" | "math";
    const title = (m[2] || m[4] || "").trim();
    const data  = m[5] ?? "";

    if (type) {
      blocks.push({
        start: m.index,
        end: vizRegex.lastIndex,
        segment: { kind: "viz", type, title: title || "Visualization", data: data.trim() },
      });
    }
  }

  // If there is an unclosed [IRIS_VIZ ...] block at the end of the text (streaming), parse it as a streaming viz segment
  const openVizRegex = /\[(?:IRIS_VIZ)(?:\s+type=["']?(mermaid|chart|math|xychart-beta)["']?\s+title=["']?([^"'\]]*)['"']?|:(mermaid|chart|math):([^\]]*))\]([\s\S]*?)$/gi;
  openVizRegex.lastIndex = 0;
  if ((m = openVizRegex.exec(text)) !== null) {
    const start = m.index;
    const isOverlapping = blocks.some(b => start >= b.start && start < b.end);
    if (!isOverlapping) {
      const rawType = (m[1] || m[3] || "").toLowerCase();
      const type = (rawType === "xychart-beta" ? "mermaid" : rawType) as "mermaid" | "chart" | "math";
      const title = (m[2] || m[4] || "").trim();
      const data  = m[5] ?? "";

      if (type) {
        blocks.push({
          start: m.index,
          end: text.length,
          segment: { kind: "viz", type, title: title || "Visualization", data: data.trim(), isStreaming: true },
        });
      }
    }
  }

  // ── IRIS_ASK ─────────────────────────────────────────────────────────────────
  // Captures everything between [IRIS_ASK ...] and [/IRIS_ASK] as the body.
  // Attributes are parsed from the tag's attribute string separately.
  const askRegex = /\[(?:IRIS_ASK|\/IRIS_ASK(?=\s|:))([^\]]*)\]([\s\S]*?)\[\/IRIS_ASK\]/gi;

  while ((m = askRegex.exec(text)) !== null) {
    const attrStr = m[1] ?? "";
    const body    = (m[2] ?? "").trim();

    // ── Extract question text ──────────────────────────────────────────────
    // Prefer `prompt=` attribute, fall back to `question=`, then raw body
    const promptAttr = attrStr.match(/(?:prompt|question)=["']([^"']*)["']/);
    const question   = (promptAttr?.[1] ?? body.split("\n")[0] ?? "").trim();

    // ── Extract options ────────────────────────────────────────────────────
    // Priority 1: body lines matching  A) / B) / A. / 1) etc.
    const bodyOptionLines = body.match(/^[A-Da-d1-4][).]\s*.+/gm);
    const bodyOptions = bodyOptionLines
      ? bodyOptionLines.map((l) => l.replace(/^[A-Da-d1-4][).]\s*/, "").trim()).filter(Boolean)
      : [];

    // Priority 2: options="A,B,C" attribute
    const optAttr    = attrStr.match(/options=["']([^"']*)["']/);
    const attrOptions = optAttr
      ? optAttr[1].split(",").map((o) => o.trim()).filter(Boolean)
      : [];

    const options = bodyOptions.length > 0 ? bodyOptions : attrOptions;

    if (question) {
      blocks.push({
        start: m.index,
        end: askRegex.lastIndex,
        segment: { kind: "ask", question, options },
      });
    }
  }

  // ── Merge blocks with surrounding text ────────────────────────────────────
  // Sorts blocks based on their position in the original text
  blocks.sort((a, b) => a.start - b.start);

  const segments: IrisSegment[] = [];
  let lastIndex = 0;

  for (const block of blocks) {
    const preceding = text.slice(lastIndex, block.start).trim();
    if (preceding) segments.push({ kind: "text", content: preceding });
    segments.push(block.segment);
    lastIndex = block.end;
  }

  const remaining = text.slice(lastIndex).trim();
  if (remaining || segments.length === 0) {
    segments.push({ kind: "text", content: remaining || text });
  }

  return segments;
};
