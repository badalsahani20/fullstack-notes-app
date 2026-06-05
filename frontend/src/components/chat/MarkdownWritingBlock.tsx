import { useState, useRef, useEffect } from "react";
import { CheckCheck, Copy, Pencil, RotateCcw, RotateCw } from "lucide-react";

type MarkdownWritingBlockProps = {
  content: string;
};

const MarkdownWritingBlock = ({ content }: MarkdownWritingBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync with prop only if we aren't actively editing
  useEffect(() => {
    if (!isEditing) {
      setLocalContent(content);
    }
  }, [content, isEditing]);

  // Auto-resize textarea as content changes
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [isEditing, localContent]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(localContent);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className={`gc-writing-block my-4 ${isEditing ? "gc-writing-is-editing" : ""}`}>
      <div className="gc-writing-header">
        <div className="gc-writing-header-left">
          <button
            type="button"
            className="gc-writing-edit-btn"
            onClick={toggleEdit}
          >
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
        {isEditing ? (
          <textarea
            ref={textareaRef}
            className="gc-writing-textarea"
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            spellCheck={false}
          />
        ) : (
          <div className="whitespace-pre-wrap">
            {localContent || "Write or type '/' for commands..."}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownWritingBlock;
