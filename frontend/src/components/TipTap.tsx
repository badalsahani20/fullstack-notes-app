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
      <EditorContent editor={editor} className="p-3 min-h-[200px]" />
    </div>
  );
};

export default TipTap;
