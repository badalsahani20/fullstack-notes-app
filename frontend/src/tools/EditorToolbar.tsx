import { Maximize2, Minimize2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

type Props = {
  editor: Editor;
  fontSize: number;
  onDecreaseFontSize: () => void;
  onIncreaseFontSize: () => void;
};

const EditorToolbar = ({ editor, fontSize, onDecreaseFontSize, onIncreaseFontSize }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isFocusMode = searchParams.get("focus") === "1";

  const btn = (active: boolean) =>
    cn(
      "rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wide transition",
      active
        ? "border-primary/60 bg-primary/20 text-primary"
        : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/10"
    );

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
    <div className="sticky top-0 z-20 mb-2 flex flex-wrap items-center gap-2 border-b border-white/8 bg-[#12192a]/75 px-2 py-2 backdrop-blur-md">
      <button onClick={toggleFocusMode} className={btn(isFocusMode)} title={isFocusMode ? "Exit focus mode" : "Focus editor"}>
        {isFocusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
      </button>

      <button onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}>
        Bold
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}>
        Italic
      </button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive("strike"))}>
        Strike
      </button>
      <button onClick={onDecreaseFontSize} className={btn(false)} title="Decrease text size">
        A-
      </button>
      <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs font-semibold text-zinc-300">{fontSize}px</span>
      <button onClick={onIncreaseFontSize} className={btn(false)} title="Increase text size">
        A+
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive("bulletList"))}
      >
        List
      </button>
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={btn(editor.isActive("paragraph"))}
      >
        Body
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={btn(editor.isActive("heading", { level: 1 }))}
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btn(editor.isActive("heading", { level: 2 }))}
      >
        H2
      </button>
    </div>
  );
};

export default EditorToolbar;
