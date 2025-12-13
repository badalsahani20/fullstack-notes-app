import { Editor } from "@tiptap/react";

type Props = {
  editor: Editor;
};
const EditorToolbar = ({ editor }: Props) => {
  return (
    <div className="flex items-center justify-center gap-5 border-b p-2">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "font-bold text-blue-600" : ""}
      >
        B
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "italic text-blue-600" : ""}
      >
        I
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={
          editor.isActive("strike") ? "line-through text-blue-600" : ""
        }
      >
        S
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={
          editor.isActive("bulletList") ? "font-bold text-blue-600" : ""
        }
      >
        • List
      </button>
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={editor.isActive("paragraph") ? "text-blue-600" : ""}
      >
        P
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={
          editor.isActive("heading", { level: 1 }) ? "text-blue-600" : ""
        }
      >
        H1
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={
          editor.isActive("heading", { level: 2 }) ? "text-blue-600" : ""
        }
      >
        H2
      </button>
    </div>
  );
};

export default EditorToolbar;
