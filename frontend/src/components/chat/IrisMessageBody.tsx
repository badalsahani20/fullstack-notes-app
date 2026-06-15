import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import { sharedMarkdownComponents } from "@/utils/sharedMarkdownComponents";
import IrisVisualBlock from "./IrisVisualBlock";
import IrisAskBlock from "./IrisAskBlock";
import type { IrisSegment } from "@/store/useGlobalChatStore";
import { sanitizeStream } from "@/utils/streamSanitizer";



interface IrisMessageBodyProps {
  segments: IrisSegment[];
  /** Called when user answers an IRIS_ASK block — injects the reply as next user message */
  onAnswer?: (answer: string) => void;
}

const IrisMessageBody = ({ segments, onAnswer }: IrisMessageBodyProps) => {
  // Track answers per ask segment key — enables sequential reveal
  const [askAnswers, setAskAnswers] = useState<Record<string, string>>({});

  // Indices of all ASK segments in document order
  const askIndices = segments
    .map((seg, i) => (seg.kind === "ask" ? i : -1))
    .filter((i) => i !== -1);

  // The first ask segment that hasn't been answered yet
  const firstUnansweredIndex = askIndices.find((i) => !askAnswers[`ask-${i}`]) ?? -1;

  return (
    <div className="iris-message-body">
      {segments.map((seg, index) => {
        const key = seg.id ?? `${seg.kind}-${index}`;

        if (seg.kind === "text") {
          return <MemoizedMarkdown key={key} content={seg.content} />;
        }

        if (seg.kind === "ask") {
          const askKey    = `ask-${index}`;
          const chosen    = askAnswers[askKey] ?? null;
          const isAnswered = chosen !== null;
          const isActive   = index === firstUnansweredIndex;
          const isPending  = !isAnswered && !isActive;

          // Don't render asks that aren't unlocked yet
          if (isPending) return null;

          return (
            <IrisAskBlock
              key={key}
              segment={seg}
              answered={isAnswered}
              chosenAnswer={chosen}
              onAnswer={(answer) => {
                setAskAnswers((prev) => ({ ...prev, [askKey]: answer }));
                onAnswer?.(answer);
              }}
            />
          );
        }

        return <IrisVisualBlock key={key} visualization={seg} />;
      })}
    </div>
  );
};

export default IrisMessageBody;




interface MarkdownProps {
  content: string;
}

const MemoizedMarkdown = React.memo(({ content }: MarkdownProps) => {
  const sanitized = sanitizeStream(content);
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      components={sharedMarkdownComponents}
    >
      {sanitized}
    </ReactMarkdown>
  );
});