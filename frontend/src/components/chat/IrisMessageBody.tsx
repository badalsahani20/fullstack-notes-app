import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import MarkdownCodeBlock from "./MarkdownCodeBlock";
import IrisVisualBlock from "./IrisVisualBlock";
import type { IrisSegment } from "@/store/useGlobalChatStore";

// 🔒 Stable markdown components (outside component)
const markdownComponents = {
  code({ className, children, ...props }: any) {
    const rawCode = String(children ?? "").replace(/\n$/, "");
    const language = className?.replace("language-", "") || "";
    const isBlock = Boolean(language) || rawCode.includes("\n");

    if (!isBlock) {
      return <code className={className} {...props}>{children}</code>;
    }

    return <MarkdownCodeBlock code={rawCode} language={language} />;
  },
  a({ node, ...props }: any) {
    return (
      <a 
        {...props} 
        target="_blank" 
        rel="noopener noreferrer"
        className="iris-link"
      />
    );
  },
};

interface IrisMessageBodyProps {
  segments: IrisSegment[];
}

const IrisMessageBody = ({ segments }: IrisMessageBodyProps) => {
  return (
    <div className="iris-message-body">
      {segments.map((seg, index) => {
        // ✅ Use stable id, fallback to index. (Never use Math.random() for React keys!)
        const key = seg.id ?? `${seg.kind}-${index}`;

        if (seg.kind === "text") {
          return <MemoizedMarkdown key={key} content={seg.content} />;
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
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={markdownComponents}
      skipHtml
    >
      {content}
    </ReactMarkdown>
  );
});