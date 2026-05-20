export class SseStreamParser {
  private buffer = "";
  private decoder = new TextDecoder();

  /**
   * Processes a raw network chunk (Uint8Array), 
   * returns an array of successfully parsed JSON payloads, 
   * and retains any incomplete lines in the internal buffer.
   */
  public processChunk(value: Uint8Array): any[] {
    // 1. Decode the chunk of bytes into text
    const chunkText = this.decoder.decode(value, { stream: true });
    
    // 2. Append to our line buffer
    this.buffer += chunkText;
    
    // 3. Split by newlines
    const lines = this.buffer.split("\n");
    
    // 4. Retain the last (potentially incomplete) element in the buffer
    this.buffer = lines.pop() || "";

    const parsedEvents: any[] = [];

    // 5. Parse complete lines
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
