import React, { useEffect, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import BubbleMenu from "@tiptap/extension-bubble-menu";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { useLocation, useNavigate } from "react-router-dom";
import EditorBubbleMenu from "./editorBubbleMenu";
import { ImageUploadExtension } from "../extensions/imageUploadExtension";
import { MarkerHighlightExtension } from "../extensions/markerHighlightExtension";
import { AiGhostExtension } from "../extensions/aiGhostExtension";
import { AiInlineMenu } from "./AiInlineMenu";

import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";

const CODE_MARKERS = [
  /(^|\n)\s{2,}\S/,
  /[{};]/,
  /\b(function|const|let|var|class|import|export|return|async|await|def|print|public|private)\b/,
  /<\/?[a-z][^>]*>/i,
];

import { Extension } from "@tiptap/core";

// Custom Font Size extension
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain().setMark("textStyle", { fontSize }).run();
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run();
      },
    } as any;
  },
});

// Custom Indent extension
const Indent = Extension.create({
  name: "indent",
  addOptions() {
    return {
      types: ["heading", "paragraph"],
      indentSize: 24,
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => parseInt(element.style.marginLeft) / this.options.indentSize || 0,
            renderHTML: (attributes) => {
              if (!attributes.indent) return {};
              return { style: `margin-left: ${attributes.indent * this.options.indentSize}px` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch }: any) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        state.doc.nodesBetween(selection.from, selection.to, (node: any, pos: any) => {
          if (this.options.types.includes(node.type.name)) {
            tr = tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              indent: (node.attrs.indent || 0) + 1,
            });
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
            if (currentIndent > 0) {
              tr = tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                indent: currentIndent - 1,
              });
            }
          }
        });
        if (dispatch) dispatch(tr);
        return true;
      },
    } as any;
  },
});

const looksLikeCodeSnippet = (text: string) =>
  text.includes("\n") && CODE_MARKERS.some((pattern) => pattern.test(text));

import { useAiChat } from "@/hooks/useAiChat";

type TipTapProps = {
  content: string;
  onChange: (html: string) => void;
  onEditorReady?: (editor: Editor | null) => void;
  aiChat?: ReturnType<typeof useAiChat>;
};

const TipTap = ({ content, onChange, onEditorReady, aiChat }: TipTapProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class: "editor-code-block",
          },
        },
      }),
      TextStyle,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Color,
      FontSize,
      Indent,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      BubbleMenu,
      ImageUploadExtension.configure({
        inline: true,
        allowBase64: true,
      }),
      MarkerHighlightExtension,
      AiGhostExtension,
      FontFamily.configure({
        types: ["textStyle"],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      handlePaste(view, event) {
        const plainText = event.clipboardData?.getData("text/plain") ?? "";
        const html = event.clipboardData?.getData("text/html") ?? "";

        if (!plainText || !looksLikeCodeSnippet(plainText)) {
          return false;
        }

        if (html && !/<(?:pre|code)\b/i.test(html)) {
          return false;
        }

        event.preventDefault();
        const { schema, tr } = view.state;
        const codeNode = schema.nodes.codeBlock?.create(
          {},
          schema.text(plainText.replace(/\r\n/g, "\n")),
        );

        if (!codeNode) {
          return false;
        }

        view.dispatch(tr.replaceSelectionWith(codeNode).scrollIntoView());
        return true;
      },
    },
  });

  const handleEditorKeyDown = (event: ReactKeyboardEvent) => {
    if (!editor) return;

    if (event.key === "Escape") {
      const next = new URLSearchParams(location.search);
      if (next.has("focus")) {
        next.delete("focus");
        const query = next.toString();
        navigate(`${location.pathname}${query ? `?${query}` : ""}`, { replace: true });
      }
      return;
    }

    if (event.key !== "Tab") return;
    event.preventDefault();

    if (editor.isActive("bulletList") || editor.isActive("orderedList")) {
      if (event.shiftKey) {
        editor.chain().focus().liftListItem("listItem").run();
        return;
      }
      editor.chain().focus().sinkListItem("listItem").run();
      return;
    }

    editor.chain().focus().insertContent("    ").run();
  };

  useEffect(() => {
    if (!onEditorReady) return;
    onEditorReady(editor ?? null);

    return () => {
      onEditorReady(null);
    };
  }, [editor, onEditorReady]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="editor-shell relative mx-auto w-full max-w-[46rem]" style={{ ["--editor-font-size" as string]: `18px` }}>
      <EditorBubbleMenu 
        editor={editor} 
        onAction={aiChat?.runAction}
        loadingAction={aiChat?.loadingAction}
      />
      <AiInlineMenu editor={editor} />
      <EditorContent className="editor-content-shell" editor={editor} spellCheck={true} onKeyDown={handleEditorKeyDown} />
    </div>
  );
};

export default React.memo(TipTap);
