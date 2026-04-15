import { useMemo, useState } from "react";
import { CheckCheck, Copy } from "lucide-react";

type MarkdownCodeBlockProps = {
  code: string;
  language?: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const normalizeLanguage = (language = "") => language.toLowerCase().trim();

const tokenPatterns: Record<string, RegExp[]> = {
  comment: [
    /\/\/[^\n]*/g,
    /\/\*[\s\S]*?\*\//g,
    /#[^\n]*/g,
    /--[^\n]*/g,
  ],
  string: [
    /"(?:\\.|[^"\\])*"/g,
    /'(?:\\.|[^'\\])*'/g,
    /`(?:\\.|[^`\\])*`/g,
  ],
  keyword: [
    /\b(?:const|let|var|function|return|if|else|for|while|switch|case|break|continue|try|catch|finally|throw|new|class|extends|import|from|export|default|async|await|typeof|instanceof|in|of|null|undefined|true|false)\b/g,
    /\b(?:def|class|lambda|from|import|as|return|if|elif|else|for|while|try|except|finally|raise|with|yield|True|False|None|async|await)\b/g,
    /\b(?:SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN|LEFT|RIGHT|INNER|OUTER|GROUP|BY|ORDER|LIMIT|AS|AND|OR|NOT|NULL|VALUES|INTO|CREATE|TABLE|ALTER|DROP)\b/gi,
    /\b(?:echo|if|then|fi|for|do|done|case|esac|function|export)\b/g,
  ],
  number: [/\b\d+(?:\.\d+)?\b/g],
  function: [/\b([A-Za-z_]\w*)(?=\()/g],
  property: [/\b([A-Za-z_]\w*)(?=:)/g],
  tag: [/<\/?[A-Za-z][^&]*?>/g],
};

const applyPattern = (
  source: string,
  pattern: RegExp,
  className: string,
  placeholders: string[]
) =>
  source.replace(pattern, (match) => {
    const token = `__TOK_${placeholders.length}__`;
    placeholders.push(`<span class="gc-token-${className}">${match}</span>`);
    return token;
  });

const highlightCode = (code: string, language?: string) => {
  const escaped = escapeHtml(code);
  const lang = normalizeLanguage(language);

  if (!escaped.trim()) {
    return escaped;
  }

  if (["html", "xml", "svg"].includes(lang)) {
    return escaped
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="gc-token-comment">$1</span>')
      .replace(/(&lt;\/?)([A-Za-z][\w:-]*)/g, '$1<span class="gc-token-tag">$2</span>')
      .replace(/([A-Za-z-:]+)=(&quot;.*?&quot;)/g, '<span class="gc-token-property">$1</span>=<span class="gc-token-string">$2</span>');
  }

  const placeholders: string[] = [];
  let highlighted = escaped;

  for (const pattern of tokenPatterns.comment) {
    highlighted = applyPattern(highlighted, pattern, "comment", placeholders);
  }

  for (const pattern of tokenPatterns.string) {
    highlighted = applyPattern(highlighted, pattern, "string", placeholders);
  }

  for (const pattern of tokenPatterns.keyword) {
    highlighted = applyPattern(highlighted, pattern, "keyword", placeholders);
  }

  for (const pattern of tokenPatterns.number) {
    highlighted = applyPattern(highlighted, pattern, "number", placeholders);
  }

  if (["json", "yaml", "yml"].includes(lang)) {
    for (const pattern of tokenPatterns.property) {
      highlighted = applyPattern(highlighted, pattern, "property", placeholders);
    }
  } else {
    for (const pattern of tokenPatterns.function) {
      highlighted = applyPattern(highlighted, pattern, "function", placeholders);
    }
  }

  for (let index = placeholders.length - 1; index >= 0; index -= 1) {
    highlighted = highlighted.replace(`__TOK_${index}__`, placeholders[index]);
  }

  return highlighted;
};

const getLanguageLabel = (language?: string) => {
  const normalized = normalizeLanguage(language);
  if (!normalized) return "Code";
  return normalized.toUpperCase();
};

const MarkdownCodeBlock = ({ code, language }: MarkdownCodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const highlighted = useMemo(() => highlightCode(code, language), [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="gc-code-block">
      <div className="gc-code-header">
        <span className="gc-code-language">{getLanguageLabel(language)}</span>
        <button type="button" className="gc-code-copy" onClick={() => void handleCopy()}>
          {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <pre className="gc-code-pre">
        <code
          className="gc-code-content"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
};

export default MarkdownCodeBlock;
