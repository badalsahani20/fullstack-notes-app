import { useEffect, useState } from "react";
import type { Message } from "@/components/ai/types";

/**
 * useTypewriter — shared streaming animation hook.
 *
 * Takes the current message list and animates the latest assistant message
 * character-by-character, simulating a typewriter / streaming effect.
 *
 * @param messages     - The full message array (same shape used by both the
 *                       in-editor AI panel and the global chat page)
 * @param skipIds      - Optional set of message IDs to never animate
 *                       (e.g. "welcome" in the note panel, history messages)
 * @param onNewMessage - Optional callback fired when animation starts,
 *                       e.g. to reset "copied" state
 */
export const useTypewriter = (
  messages: Message[],
  skipIds: Set<string> = new Set(),
  onNewMessage?: () => void,
) => {
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamedMessageText, setStreamedMessageText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    const latest = messages[messages.length - 1];

    // Nothing to animate
    if (
      !latest ||
      latest.role !== "assistant" ||
      skipIds.has(latest.id) ||
      latest.skipAnimation
    ) {
      setStreamingMessageId(null);
      setStreamedMessageText("");
      setIsStreaming(false);
      return;
    }

    onNewMessage?.();
    setIsStreaming(true);
    setStreamingMessageId(latest.id);
    setStreamedMessageText("");

    // Adaptive step: longer messages advance faster so they finish in ~1.7s
    const step = Math.max(4, Math.ceil(latest.text.length / 120));
    let index = 0;

    const timer = window.setInterval(() => {
      index = Math.min(latest.text.length, index + step);
      setStreamedMessageText(latest.text.slice(0, index));
      if (index >= latest.text.length) {
        window.clearInterval(timer);
        setIsStreaming(false);
      }
    }, 14);

    return () => window.clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  return { streamingMessageId, streamedMessageText, isStreaming };
};
