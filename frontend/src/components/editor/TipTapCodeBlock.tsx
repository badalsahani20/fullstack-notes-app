import React, { useState } from "react";
import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react";
import { CheckCheck, Copy } from "lucide-react";

export const TipTapCodeBlock = React.memo(({ node, editor, getPos }: NodeViewProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    let currentText = node.textContent;
    if (typeof getPos === 'function') {
      const pos = getPos();
      if (typeof pos === 'number') {
        const liveNode = editor.state.doc.nodeAt(pos);
        if (liveNode) {
          currentText = liveNode.textContent;
        }
      }
    }
    await navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <NodeViewWrapper className="gc-code-block editor-code-block tiptap-nodeview my-4">
      <div className="gc-code-header" contentEditable={false}>
        <div className="relative">
          <span className="text-xs text-[#a5b4fc] font-medium px-2 uppercase tracking-wider">
            Code Snippet
          </span>
        </div>
        <button type="button" className="gc-code-copy" onClick={handleCopy}>
          {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <pre className="gc-code-pre">
        <NodeViewContent 
          as={"code" as any} 
          className="gc-code-content outline-none" 
        />
      </pre>
    </NodeViewWrapper>
  );
}, () => true); // Fully freeze React wrapper from updating during rapid typing
