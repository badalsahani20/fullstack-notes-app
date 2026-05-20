export class SseStreamParser {
  constructor() {
    this.buffer = "";
    this.decoder = new TextDecoder();
  }

  /**
   * Processes a raw network chunk (Buffer or Uint8Array), 
   * returns an array of successfully parsed JSON payloads, 
   * and retains any incomplete lines in the internal buffer.
   */
  processChunk(chunk) {
    const chunkText = this.decoder.decode(chunk, { stream: true });
    this.buffer += chunkText;
    const lines = this.buffer.split("\n");
    this.buffer = lines.pop() || "";

    const parsedEvents = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
        try {
          const payload = JSON.parse(trimmed.slice(6));
          parsedEvents.push(payload);
        } catch {
          // Ignore invalid/half-finished JSON lines
        }
      }
    }

    return parsedEvents;
  }
}
