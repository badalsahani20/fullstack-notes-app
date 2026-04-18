import React, { useRef } from "react";
import {
  Bold, Italic, Underline, Strikethrough, Highlighter,
  List, ListOrdered, CheckSquare,
  Image as ImageIcon, Table as TableIcon,
  Minus, Quote, Code, Eraser,
  Maximize2, Minimize2
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/utils/uploadImage";
import { toast } from "sonner";
import { useEditorUIStore } from "@/store/useEditorUIStore";
type Props = {
  editor: Editor;
  isMobile?: boolean;
  yOffset?: number;
};

const EditorToolbar = ({ editor, isMobile, yOffset = 0 }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const focusParam = searchParams.get("focus");
  const isFocusMode = focusParam === "1" || focusParam === "2";
  const { markerColor } = useEditorUIStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const toastId = toast.loading("Uploading image...");
    try {
      const url = await uploadImage(file);
      editor.chain().focus().setImage({ src: url }).run();
      toast.success("Image uploaded!", { id: toastId });
    } catch (error) {
      toast.error("Upload failed", { id: toastId });
    } finally {
      event.target.value = "";
    }
  };

  const toggleFocusMode = () => {
    const next = new URLSearchParams(location.search);
    if (isFocusMode) next.delete("focus");
    else next.set("focus", "1");
    navigate(`${location.pathname}?${next.toString()}`, { replace: true });
  };

  return (
    <div 
      className={cn("dock-toolbar-wrapper", isMobile && "dock-toolbar-mobile")}
      style={isMobile ? { transform: `translateY(-${yOffset}px)` } : undefined}
    >
      <div className="dock-toolbar">
        <div className="dock-toolbar-inner">
          {/* Group 1: Utilities */}
          <div className="dock-toolbar-cluster">
            <ToolbarButton 
              active={isFocusMode} 
              onClick={toggleFocusMode} 
              icon={isFocusMode ? <Minimize2 size={16} strokeWidth={1.5} /> : <Maximize2 size={16} strokeWidth={1.5} />} 
              title="Toggle Focus Mode" 
              color="#3b82f6"
            />
          </div>

          <div className="dock-divider" />

          {/* Group 2: Basic Formatting */}
          <div className="dock-toolbar-cluster">
            <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} icon={<Bold size={16} strokeWidth={1.5} />} title="Bold" color="#10b981" />
            <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} icon={<Italic size={16} strokeWidth={1.5} />} title="Italic" color="#10b981" />
            <ToolbarButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} icon={<Underline size={16} strokeWidth={1.5} />} title="Underline" color="#10b981" />
            <ToolbarButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} icon={<Strikethrough size={16} strokeWidth={1.5} />} title="Strikethrough" color="#10b981" />
            <ToolbarButton active={editor.isActive("markerHighlight")} onClick={() => editor.chain().focus().toggleMarkerHighlight(markerColor).run()} icon={<Highlighter size={16} strokeWidth={1.5} />} title="Highlight" color="#fbbf24" />
          </div>

          <div className="dock-divider" />

          {/* Group 3: Lists */}
          <div className="dock-toolbar-cluster">
            <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} icon={<List size={16} strokeWidth={1.5} />} title="Bullet List" color="#3b82f6" />
            <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} icon={<ListOrdered size={16} strokeWidth={1.5} />} title="Numbered List" color="#3b82f6" />
            <ToolbarButton active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()} icon={<CheckSquare size={16} strokeWidth={1.5} />} title="Task List" color="#3b82f6" />
          </div>

          <div className="dock-divider" />

          {/* Group 4: Insertions */}
          <div className="dock-toolbar-cluster">
            <ToolbarButton active={false} onClick={() => fileInputRef.current?.click()} icon={<ImageIcon size={16} strokeWidth={1.5} />} title="Insert Image" color="#8b5cf6" />
            <ToolbarButton active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={<Minus size={16} strokeWidth={1.5} />} title="Horizontal Rule" color="#8b5cf6" />
            <ToolbarButton active={editor.isActive("table")} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} icon={<TableIcon size={16} strokeWidth={1.5} />} title="Insert Table" color="#8b5cf6" />
          </div>

          <div className="dock-divider" />

          {/* Group 5: Blocks */}
          <div className="dock-toolbar-cluster">
            <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} icon={<Quote size={16} strokeWidth={1.5} />} title="Blockquote" color="#f43f5e" />
            <ToolbarButton active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} icon={<Code size={16} strokeWidth={1.5} />} title="Code Block" color="#f43f5e" />
          </div>

          <div className="dock-divider" />

          {/* Group 6: Cleanup */}
          <div className="dock-toolbar-cluster">
            <ToolbarButton active={false} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} icon={<Eraser size={16} strokeWidth={1.5} />} title="Clear Formatting" color="#ef4444" />
          </div>
        </div>
      </div>
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
    </div>
  );
};

const ToolbarButton = ({ active, onClick, icon, title, className, color }: { active: boolean, onClick: () => void, icon: React.ReactNode, title: string, className?: string, color?: string }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()}
    className={cn(
      "dock-btn transition-all duration-300",
      active && "dock-btn-active",
      className
    )}
    style={{ "--highlight-color": color } as React.CSSProperties}
  >
    <div className="dock-icon-wrapper">
      {icon}
    </div>
  </button>
);

export default EditorToolbar;
