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

const CODE_MARKERS = [
  /(^|\n)\s{2,}\S/,
  /[{};]/,
  /\b(function|const|let|var|class|import|export|return|async|await|def|print|public|private)\b/,
  /<\/?[a-z][^>]*>/i,
];

const looksLikeCodeSnippet = (text: string) =>
  text.includes("\n") && CODE_MARKERS.some((pattern) => pattern.test(text));

type TipTapProps = {
  content: string;
  onChange: (html: string) => void;
  onEditorReady?: (editor: Editor | null) => void;
};

const TipTap = ({ content, onChange, onEditorReady }: TipTapProps) => {
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
      BubbleMenu,
      ImageUploadExtension.configure({
        inline: true,
        allowBase64: true,
      }),
      MarkerHighlightExtension,
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
      <EditorBubbleMenu editor={editor} />
      <EditorContent className="editor-content-shell" editor={editor} spellCheck={true} onKeyDown={handleEditorKeyDown} />
    </div>
  );
};

export default React.memo(TipTap);
