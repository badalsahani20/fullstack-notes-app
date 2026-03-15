import {
  Bold,
  CheckSquare,
  Image,
  Italic,
  Link2,
  List,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

type Props = {
  editor: Editor;
};

const EditorToolbar = ({ editor }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isFocusMode = searchParams.get("focus") === "1";
  const toolbarButtonClass = (active = false) => cn("editor-toolbar-button", active && "editor-toolbar-button-active");

  const toggleFocusMode = () => {
    const next = new URLSearchParams(location.search);
    if (isFocusMode) {
      next.delete("focus");
    } else {
      next.set("focus", "1");
    }

    const query = next.toString();
    navigate(`${location.pathname}${query ? `?${query}` : ""}`, { replace: true });
  };

  return (
    <div className="editor-toolbar flex flex-col">
      <div className="editor-toolbar-group">
        <button type="button" onClick={toggleFocusMode} className={toolbarButtonClass(isFocusMode)} title="Toggle focus mode">
          {isFocusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
        <button type="button" title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} className={toolbarButtonClass(editor.isActive("bold"))}>
          <Bold size={14} />
        </button>
        <button type="button" title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} className={toolbarButtonClass(editor.isActive("italic"))}>
          <Italic size={14} />
        </button>
        <button
          type="button"
          title="bullet-points"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolbarButtonClass(editor.isActive("bulletList"))}
        >
          <List size={14} />
        </button>
        <button title="check square" type="button" aria-label="CheckSquare" className={toolbarButtonClass(false)}>
          <CheckSquare size={14} />
        </button>
        <button title="add link" type="button" className={toolbarButtonClass(false)}>
          <Link2 size={14} />
        </button>
        <button type="button" title="add image" className={toolbarButtonClass(false)}>
          <Image size={14} />
        </button>
      </div>
    </div>
  );
};

export default EditorToolbar;
