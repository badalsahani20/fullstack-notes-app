import { useEditor, EditorContent } from "@tiptap/react";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import EditorToolbar from "../pages/EditorToolbar";

type TipTapProps = {
  content: string,
  onChange: (html: string) => void;
}
const TipTap = ({content, onChange} : TipTapProps) => {
    
  const editor = useEditor({
    extensions: [
        StarterKit,
        TextStyle,
        FontFamily.configure({
            types: ['textStyle'],
        }),
    ],
    content,
    onUpdate:({editor}) => {
      onChange(editor.getHTML());
    }
  });

  if(!editor) {
    return <div>Loading editor...</div>
  }
  
  return (
    <div className="border rounded-md p-3">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="p-3 [&_.ProseMirror]:text-[18px] [&_.ProseMirror]:mx-auto  [&_.ProseMirror]:max-w-[720px] [&_.ProseMirror]:w-full [&_.ProseMirror]:text-left [&_.ProseMirror]:leading-relaxed
    [&_.ProseMirror]:space-y-2

    [&_.ProseMirror]:outline-none min-h-[200px]" />
    </div>
  );
};

export default TipTap;
