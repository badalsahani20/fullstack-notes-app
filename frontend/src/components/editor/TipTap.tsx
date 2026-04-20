import React, { useEffect, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { DOMParser } from "prosemirror-model";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import BubbleMenu from "@tiptap/extension-bubble-menu";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import StarterKit from "@tiptap/starter-kit";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { useLocation, useNavigate } from "react-router-dom";
import EditorBubbleMenu from "./EditorBubbleMenu";
import { ImageUploadExtension } from "../../extensions/imageUploadExtension";
import { MarkerHighlightExtension } from "../../extensions/markerHighlightExtension";
import { AiGhostExtension } from "../../extensions/aiGhostExtension";
import { AiInlineMenu } from "./AiInlineMenu";

import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";

// Patterns that indicate the content is a DOCUMENT, not code
const DOCUMENT_PATTERNS = [
  /^#{1,6}\s/m,           // Markdown headings (# ## ### etc.)
  /^\s*[-*+]\s/m,         // Bullet points
  /^\s*\d+\.\s/m,         // Numbered lists
  /^\|.+\|/m,             // Table rows
  /^\s*>/m,               // Blockquotes
  /^\s*- \[[ x]\]/m,      // Task lists
  /^---+$/m,              // Horizontal rules
];

const CODE_MARKERS = [
  /[{};]\s*\n/,
  /\b(function|const|let|var|class|import|export|async|await|def|print)\b\s*[\s(]/,
  /=>\s*[{(]/,
  /^\s*(if|for|while|switch)\s*\(/m,
];

const looksLikeCodeSnippet = (text: string) => {
  if (!text.includes("\n")) return false;
  // If text looks like a document, it's NOT code
  if (DOCUMENT_PATTERNS.some((p) => p.test(text))) return false;
  // Require at least 2 different code markers to be confident
  const matchCount = CODE_MARKERS.filter((p) => p.test(text)).length;
  return matchCount >= 2;
};

/** Lightweight Markdown → HTML converter for paste handling */
const markdownToHtml = (md: string): string => {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      out.push("<hr>");
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      out.push(`<h${level}>${inlineFormat(headingMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    // Table: detect header row followed by separator
    if (
      i + 1 < lines.length &&
      line.includes("|") &&
      /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(lines[i + 1].trim())
    ) {
      const tableHtml: string[] = ["<table>"];

      // Header
      const headers = parseTableRow(line);
      tableHtml.push("<tr>");
      headers.forEach((h) => tableHtml.push(`<th>${inlineFormat(h)}</th>`));
      tableHtml.push("</tr>");
      i += 2; // skip header + separator

      // Body rows
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        const cells = parseTableRow(lines[i]);
        tableHtml.push("<tr>");
        cells.forEach((c) => tableHtml.push(`<td>${inlineFormat(c)}</td>`));
        tableHtml.push("</tr>");
        i++;
      }

      tableHtml.push("</table>");
      out.push(tableHtml.join(""));
      continue;
    }

    // Blockquote
    if (line.match(/^\s*>\s?/)) {
      const content = line.replace(/^\s*>\s?/, "");
      out.push(`<blockquote><p>${inlineFormat(content)}</p></blockquote>`);
      i++;
      continue;
    }

    // Unordered list item
    if (line.match(/^\s*[-*+]\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\s*[-*+]\s/)) {
        const taskMatch = lines[i].match(/^\s*[-*+]\s+\[([ x])\]\s+(.*)/);
        if (taskMatch) {
          const checked = taskMatch[1] === "x" ? ' data-checked="true"' : "";
          listItems.push(`<li data-type="taskItem"${checked}><p>${inlineFormat(taskMatch[2])}</p></li>`);
        } else {
          listItems.push(`<li><p>${inlineFormat(lines[i].replace(/^\s*[-*+]\s+/, ""))}</p></li>`);
        }
        i++;
      }
      out.push(`<ul>${listItems.join("")}</ul>`);
      continue;
    }

    // Ordered list item
    if (line.match(/^\s*\d+\.\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\s*\d+\.\s/)) {
        listItems.push(`<li><p>${inlineFormat(lines[i].replace(/^\s*\d+\.\s+/, ""))}</p></li>`);
        i++;
      }
      out.push(`<ol>${listItems.join("")}</ol>`);
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Regular paragraph
    out.push(`<p>${inlineFormat(line)}</p>`);
    i++;
  }

  return out.join("");
};

/** Convert inline Markdown (bold, italic, code, links) to HTML */
const inlineFormat = (text: string): string =>
  text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");

/** Split a Markdown table row into cells */
const parseTableRow = (row: string): string[] =>
  row
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());

import { Extension } from "@tiptap/core";

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() { return { types: ["textStyle"] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (element) => element.style.fontSize.replace(/['"]+/g, ""),
          renderHTML: (attributes) => attributes.fontSize ? { style: `font-size: ${attributes.fontSize}` } : {},
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize: () => ({ chain }: any) => chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    } as any;
  },
});

const Indent = Extension.create({
  name: "indent",
  addOptions() { return { types: ["heading", "paragraph"], indentSize: 24 }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        indent: {
          default: 0,
          parseHTML: (element) => parseInt(element.style.marginLeft) / this.options.indentSize || 0,
          renderHTML: (attributes) => attributes.indent ? { style: `margin-left: ${attributes.indent * this.options.indentSize}px` } : {},
        },
      },
    }];
  },
  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch }: any) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        state.doc.nodesBetween(selection.from, selection.to, (node: any, pos: any) => {
          if (this.options.types.includes(node.type.name)) {
            tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: (node.attrs.indent || 0) + 1 });
          }
        });
        if (dispatch) dispatch(tr);
        return true;
      },
      outdent: () => ({ tr, state, dispatch }: any) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        state.doc.nodesBetween(selection.from, selection.to, (node: any, pos: any) => {
          if (this.options.types.includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            if (currentIndent > 0) tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: currentIndent - 1 });
          }
        });
        if (dispatch) dispatch(tr);
        return true;
      },
    } as any;
  },
});

import { useAiChat } from "@/hooks/useAiChat";

type TipTapProps = {
  content: string;
  onChange?: (html: string) => void;
  onEditorReady?: (editor: Editor | null) => void;
  aiChat?: ReturnType<typeof useAiChat>;
  editable?: boolean;
};

const TipTap = ({ content, onChange, onEditorReady, aiChat, editable = true }: TipTapProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const editor = useEditor({
    editable,
    extensions: [
      StarterKit.configure({
        codeBlock: { HTMLAttributes: { class: "editor-code-block" } },
      }),
      TextStyle,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Color, FontSize, Indent, TaskList,
      TaskItem.configure({ nested: true }),
      BubbleMenu,
      ImageUploadExtension.configure({ inline: true, allowBase64: true }),
      MarkerHighlightExtension,
      AiGhostExtension,
      FontFamily.configure({ types: ["textStyle"] }),
      Table.configure({ resizable: true }),
      TableRow, TableHeader, TableCell,
    ],
    content,
    onUpdate: ({ editor }) => { onChange?.(editor.getHTML()); },
    editorProps: {
      handlePaste(view, event) {
        const plainText = event.clipboardData?.getData("text/plain") ?? "";
        const html = event.clipboardData?.getData("text/html") ?? "";

        // If clipboard has rich HTML with tables, let TipTap handle it natively
        if (html && /<(?:table|tr|td|th)\b/i.test(html)) {
          return false;
        }

        // If it looks like a document (Markdown), convert to HTML and insert
        if (plainText && DOCUMENT_PATTERNS.some((p) => p.test(plainText))) {
          event.preventDefault();
          const convertedHtml = markdownToHtml(plainText);
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = convertedHtml;
          const { state } = view;
          const parser = DOMParser.fromSchema(state.schema);
          const parsedSlice = parser.parseSlice(tempDiv);
          const tr = state.tr.replaceSelection(parsedSlice);
          view.dispatch(tr.scrollIntoView());
          return true;
        }

        // Only wrap in code block if it genuinely looks like source code
        if (!plainText || !looksLikeCodeSnippet(plainText)) {
          return false;
        }

        // If there's HTML but NO code tags, skip auto-wrapping
        if (html && !/<(?:pre|code)\b/i.test(html)) {
          return false;
        }

        event.preventDefault();
        const { schema, tr } = view.state;
        const codeNode = schema.nodes.codeBlock?.create({}, schema.text(plainText.replace(/\r\n/g, "\n")));
        if (!codeNode) return false;
        view.dispatch(tr.replaceSelectionWith(codeNode).scrollIntoView());
        return true;
      },
    },
  });

  const handleEditorKeyDown = (event: ReactKeyboardEvent) => {
    if (!editor || !editable) return;
    if (event.key === "Escape") {
      const next = new URLSearchParams(location.search);
      if (next.has("focus")) {
        next.delete("focus");
        navigate(`${location.pathname}${next.toString() ? `?${next.toString()}` : ""}`, { replace: true });
      }
      return;
    }
    if (event.key !== "Tab") return;
    event.preventDefault();
    if (editor.isActive("bulletList") || editor.isActive("orderedList")) {
      if (event.shiftKey) editor.chain().focus().liftListItem("listItem").run();
      else editor.chain().focus().sinkListItem("listItem").run();
      return;
    }
    editor.chain().focus().insertContent("    ").run();
  };

  useEffect(() => {
    if (!onEditorReady) return;
    onEditorReady(editor ?? null);
    return () => onEditorReady(null);
  }, [editor, onEditorReady]);

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div className="editor-shell relative mx-auto w-full max-w-[46rem]" style={{ ["--editor-font-size" as string]: `18px` }}>
      {editable && aiChat && (
        <EditorBubbleMenu editor={editor} onAction={aiChat.runAction} loadingAction={aiChat.loadingAction} />
      )}
      {editable && <AiInlineMenu editor={editor} />}
      <div className="overflow-x-auto">
        <EditorContent className="editor-content-shell" editor={editor} spellCheck={editable} onKeyDown={handleEditorKeyDown} />
      </div>
    </div>
  );
};

export default React.memo(TipTap);
