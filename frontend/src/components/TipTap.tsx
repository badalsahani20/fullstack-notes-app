import { useEffect, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import BubbleMenu from "@tiptap/extension-bubble-menu";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import EditorBubbleMenu from "./editorBubbleMenu";
import EditorToolbar from "../tools/EditorToolbar";

type TipTapProps = {
  content: string;
  onChange: (html: string) => void;
  onEditorReady?: (editor: Editor | null) => void;
};

const TipTap = ({ content, onChange, onEditorReady }: TipTapProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      BubbleMenu,
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
  });

  const handleEditorKeyDown = (event: ReactKeyboardEvent) => {
    if (!editor || event.key !== "Tab") return;
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
    <div className="editor-shell relative mx-auto w-full max-w-4xl" style={{ ["--editor-font-size" as string]: `18px` }}>
      <EditorToolbar editor={editor} />
      <EditorBubbleMenu editor={editor} />
      <EditorContent className="editor-content-shell" editor={editor} spellCheck={true} onKeyDown={handleEditorKeyDown} />
    </div>
  );
};

export default TipTap;
