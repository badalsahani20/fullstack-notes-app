import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Italic, Strikethrough, Code, Highlighter } from "lucide-react";
import { cn } from "@/lib/utils";

const EditorBubbleMenu = ({ editor }: { editor: Editor }) => {
  return (
    <BubbleMenu
      editor={editor}
      options={{
        placement: "bottom",
        offset: { mainAxis: 10 },
        shift: true,
        flip: true,
      }}
      className="z-[80] flex items-center gap-1 rounded-xl border border-white/15 bg-[#111a2b]/95 p-1.5 shadow-2xl backdrop-blur-md"
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          "rounded-md p-2 transition-colors",
          editor.isActive("bold")
            ? "bg-white/10 text-primary"
            : "text-zinc-300 hover:bg-white/10 hover:text-zinc-100"
        )}
      >
        <Bold size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          "rounded-md p-2 transition-colors",
          editor.isActive("italic")
            ? "bg-white/10 text-primary"
            : "text-zinc-300 hover:bg-white/10 hover:text-zinc-100"
        )}
      >
        <Italic size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn(
          "rounded-md p-2 transition-colors",
          editor.isActive("strike")
            ? "bg-white/10 text-primary"
            : "text-zinc-300 hover:bg-white/10 hover:text-zinc-100"
        )}
      >
        <Strikethrough size={16} />
      </button>

      <div className="mx-1 h-4 w-px bg-white/15" />

      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={cn(
          "rounded-md p-2 transition-colors",
          editor.isActive("code")
            ? "bg-white/10 text-primary"
            : "text-zinc-300 hover:bg-white/10 hover:text-zinc-100"
        )}
      >
        <Code size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleMarkerHighlight("#fef08a").run()}
        className={cn(
          "rounded-md p-2 transition-colors",
          editor.isActive("markerHighlight")
            ? "bg-white/10 text-primary"
            : "text-zinc-300 hover:bg-white/10 hover:text-zinc-100"
        )}
      >
        <Highlighter size={16} />
      </button>
    </BubbleMenu>
  );
};

export default EditorBubbleMenu;
