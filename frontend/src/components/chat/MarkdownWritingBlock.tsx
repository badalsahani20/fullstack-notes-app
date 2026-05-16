import { useState } from "react";
import { CheckCheck, Copy, Pencil, RotateCcw, RotateCw } from "lucide-react";

type MarkdownWritingBlockProps = {
  content: string;
};

const MarkdownWritingBlock = ({ content }: MarkdownWritingBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="gc-writing-block my-4">
      <div className="gc-writing-header">
        <div className="gc-writing-header-left">
          <button type="button" className="gc-writing-edit-btn">
            <Pencil size={14} />
            <span>Edit</span>
          </button>
        </div>
        <div className="gc-writing-header-right">
          <button type="button" className="gc-writing-action-btn" title="Undo">
            <RotateCcw size={15} />
          </button>
          <button type="button" className="gc-writing-action-btn" title="Redo">
            <RotateCw size={15} />
          </button>
          <div className="gc-writing-divider" />
          <button
            type="button"
            className="gc-writing-action-btn"
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy text"}
          >
            {copied ? (
              <CheckCheck size={16} className="text-emerald-500" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>
      </div>
      <div className="gc-writing-content">
        {content || "Write or type '/' for commands..."}
      </div>
    </div>
  );
};

export default MarkdownWritingBlock;
