import { useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import BubbleMenu from "@tiptap/extension-bubble-menu";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
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
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

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
    <div className="relative">
      <EditorToolbar editor={editor} />
      <EditorBubbleMenu editor={editor} />
      <EditorContent editor={editor} spellCheck={true} />
    </div>
  );
};

export default TipTap;
