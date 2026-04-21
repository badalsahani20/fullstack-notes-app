import { useState } from "react";
import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react";
import { CheckCheck, Copy } from "lucide-react";

const SUPPORTED_LANGUAGES = [
  { value: "", label: "Code (Auto)" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "python", label: "Python" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash/Shell" },
  { value: "markdown", label: "Markdown" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "sql", label: "SQL" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" }
];

export const TipTapCodeBlock = ({ node, updateAttributes }: NodeViewProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(node.textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const language = node.attrs.language || "";

  return (
    <NodeViewWrapper className="gc-code-block editor-code-block tiptap-nodeview my-4">
      <div className="gc-code-header" contentEditable={false}>
        <div className="relative">
          <select
            className="gc-code-language bg-transparent text-xs outline-none border-none cursor-pointer appearance-none pr-4"
            value={language}
            onChange={(e) => updateAttributes({ language: e.target.value })}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value} className="bg-slate-900 text-slate-200">
                {lang.label}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
        <button type="button" className="gc-code-copy" onClick={handleCopy}>
          {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <pre className="gc-code-pre">
        <NodeViewContent as={"code" as any} className="gc-code-content outline-none" />
      </pre>
    </NodeViewWrapper>
  );
};
