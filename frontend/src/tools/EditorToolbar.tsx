import {
  Bold,
  Code2,
  Heading1,
  Heading2,
  Highlighter,
  Image,
  Italic,
  List,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Pilcrow,
  Sparkles,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/utils/uploadImage";
import { useRef } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  editor: Editor;
  onAskAi?: () => void;
};

const EditorToolbar = ({ editor, onAskAi }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const focusParam = searchParams.get("focus");
  const isFocusMode = focusParam === "1" || focusParam === "2";
  const toolbarButtonClass = (active = false) => cn("editor-toolbar-button", active && "editor-toolbar-button-active");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if(!file) return;

    const toastId = toast.loading("Uploading image...");
    try {
      const url = await uploadImage(file);
      editor.chain().focus().setImage({ src: url}).run();
      toast.success("Image uploaded!", { id: toastId });
    } catch (error) {
      console.error("Failed to upload image", error);
      toast.error("Failed to upload image", { id: toastId });
    } finally {
      // Clear the input so selecting the same file again triggers the onChange event
      event.target.value = "";
    }
  }
  
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              title="Text styles"
              className={toolbarButtonClass(
                editor.isActive("heading", { level: 1 }) ||
                editor.isActive("heading", { level: 2 }) ||
                editor.isActive("paragraph"),
              )}
            >
              <Pilcrow size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="editor-toolbar-menu w-44">
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setParagraph().run()}
              className="editor-toolbar-menu-item"
            >
              <Pilcrow size={14} />
              <span>Paragraph</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className="editor-toolbar-menu-item"
            >
              <Heading1 size={14} />
              <span>Heading 1</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className="editor-toolbar-menu-item"
            >
              <Heading2 size={14} />
              <span>Heading 2</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          type="button"
          title="Marker"
          onClick={() => editor.chain().focus().toggleMarkerHighlight("#fef08a").run()}
          className={toolbarButtonClass(editor.isActive("markerHighlight"))}
        >
          <Highlighter size={14} />
        </button>
        <button
          type="button"
          title="bullet-points"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolbarButtonClass(editor.isActive("bulletList"))}
        >
          <List size={14} />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" title="More tools" className={toolbarButtonClass(editor.isActive("codeBlock"))}>
              <MoreHorizontal size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="editor-toolbar-menu w-44">
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className="editor-toolbar-menu-item"
            >
              <Code2 size={14} />
              <span>Code block</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => fileInputRef.current?.click()}
              className="editor-toolbar-menu-item"
            >
              <Image size={14} />
              <span>Upload image</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
        {onAskAi ? (
          <button
            type="button"
            title="Ask AI"
            onClick={onAskAi}
            className={cn(toolbarButtonClass(false), "editor-toolbar-ai-button md:hidden")}
          >
            <Sparkles size={14} />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default EditorToolbar;
