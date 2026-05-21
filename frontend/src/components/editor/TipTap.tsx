import React, { useEffect, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Extension } from "@tiptap/core";
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
import { TipTapCodeBlock } from "./TipTapCodeBlock";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { DOCUMENT_PATTERNS, markdownToHtml } from "@/utils/markdownToHtml";

const CODE_MARKERS = [
  /[{};]\s*\n/,
  /\b(function|const|let|var|class|import|export|async|await|def|print)\b\s*[\s(]/,
  /=>\s*[{(]/,
  /^\s*(if|for|while|switch)\s*\(/m,
];

const looksLikeCodeSnippet = (text: string) => {
  if (!text.includes("\n")) return false;
  const matchCount = CODE_MARKERS.filter((p) => p.test(text)).length;
  if (matchCount >= 2) return true; // Strong code confidence overrides document patterns
  if (DOCUMENT_PATTERNS.some((p) => p.test(text))) return false; // Likely a document with a stray code word
  return matchCount >= 1;
};

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

const lowlight = createLowlight(common);

const CustomCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(TipTapCodeBlock);
  },
}).configure({ lowlight, defaultLanguage: "javascript" });

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
        codeBlock: false, // Disabling native codeBlock to use our CustomCodeBlock
      }),
      CustomCodeBlock,
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

        // 1. Prioritize native IDE code blocks
        const isIdeCopy = html && /vscode-editor-data|font-family:.*?(?:Consolas|monospace|Courier|JetBrains)/i.test(html);
        const isCode = plainText && (isIdeCopy || looksLikeCodeSnippet(plainText));

        if (isCode) {
          // Wrap in code block if there's no rich HTML indicating it's a styled document
          if (!html || (/<(?:pre|code|div|span)\b/i.test(html) && !/<(?:h[1-6]|ul|ol|table)\b/i.test(html))) {
            event.preventDefault();
            const { schema, tr } = view.state;
            const codeNode = schema.nodes.codeBlock?.create({}, schema.text(plainText.replace(/\r\n/g, "\n")));
            if (codeNode) {
              view.dispatch(tr.replaceSelectionWith(codeNode).scrollIntoView());
              return true;
            }
          }
        }

        // 2. Is there valid strong rich HTML?
        // If the OS/browser gave us real formatted HTML components, let TipTap handle it natively instead of guessing with Markdown.
        // We include data-type="table" because TipTap sometimes uses divs with data attributes.
        const hasRichHtml = html && /<(?:h[1-6]|ul|ol|li|table|tr|td|th|blockquote|strong|em|b|i|u|a\b|div[^>]*data-)/i.test(html);
        if (hasRichHtml) {
          return false;
        }

        // 3. Fallback: Parse as Markdown if it matches document structure
        // This gracefully catches mobile Plain Text Table copies or raw Markdown pastes
        if (plainText && DOCUMENT_PATTERNS.some((p) => p.test(plainText)) || plainText.includes("\t")) {
          // Even if it doesn't match DOCUMENT_PATTERNS perfectly, tab-separation strongly hints at a table
          event.preventDefault();
          const convertedHtml = markdownToHtml(plainText);
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = convertedHtml;
          const { state } = view;
          const parser = DOMParser.fromSchema(state.schema);

          try {
            const parsedSlice = parser.parseSlice(tempDiv);
            const tr = state.tr.replaceSelection(parsedSlice);
            view.dispatch(tr.scrollIntoView());
            return true;
          } catch (e) {
            console.warn("Markdown parse failed, falling back to basic paste", e);
            return false;
          }
        }

        return false;
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

export default React.memo(TipTap, (prevProps, nextProps) => {
  return (
    prevProps.content === nextProps.content &&
    prevProps.editable === nextProps.editable &&
    prevProps.onChange === nextProps.onChange &&
    prevProps.onEditorReady === nextProps.onEditorReady &&
    prevProps.aiChat?.loadingAction === nextProps.aiChat?.loadingAction
  );
});
