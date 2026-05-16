import React, { useState, useRef, useEffect } from "react";
import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react";
import { CheckCheck, Copy, Code2 } from "lucide-react";

export const TipTapCodeBlock = React.memo(({ node, editor, getPos }: NodeViewProps) => {
  const [copied, setCopied] = useState(false);
  
  // Use a ref to always have the latest content for the copy button 
  // without triggering re-renders of the frozen memo
  const contentRef = useRef(node.textContent);
  
  useEffect(() => {
    contentRef.current = node.textContent;
  }, [node.textContent]);

  const handleCopy = async () => {
    let textToCopy = contentRef.current;
    
    // Try to get live content from editor if possible
    if (typeof getPos === 'function') {
      const pos = getPos();
      if (typeof pos === 'number') {
        const liveNode = editor.state.doc.nodeAt(pos);
        if (liveNode) textToCopy = liveNode.textContent;
      }
    }
    
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <NodeViewWrapper className="gc-code-block editor-code-block tiptap-nodeview">
      <div className="gc-code-header" contentEditable={false}>
        <div className="gc-code-header-left">
          <Code2 size={14} className="gc-code-lang-icon" />
          <span className="gc-code-language">
            {(node.attrs.language || "code").toUpperCase()}
          </span>
        </div>
        <button 
          type="button" 
          className="gc-code-copy" 
          onClick={handleCopy}
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <CheckCheck size={15} className="gc-code-copy-icon-ok" />
          ) : (
            <Copy size={15} />
          )}
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
}, () => true);
