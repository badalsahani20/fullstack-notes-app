import React, { useRef } from "react";
import {
  Bold, Italic, Underline, Strikethrough, Highlighter,
  List, ListOrdered, CheckSquare,
  Image as ImageIcon, Table as TableIcon,
  Minus, Quote, Code, Eraser,
  Maximize2, Minimize2, Sparkles
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/utils/uploadImage";
import { toast } from "sonner";


type Props = {
  editor: Editor;
  onAskAi?: () => void;
  isMobile?: boolean;
  yOffset?: number;
};

const EditorToolbar = ({ editor, onAskAi, isMobile, yOffset = 0 }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const focusParam = searchParams.get("focus");
  const isFocusMode = focusParam === "1" || focusParam === "2";
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toolbarButtonClass = (active = false) => cn(
    "flex items-center justify-center rounded-md p-1.5 transition-colors focus:outline-none",
    active ? "bg-[var(--active-surface)] text-[var(--accent-strong)] shadow-sm" : "text-[var(--muted-text)] hover:bg-[var(--surface-ghost)] hover:text-[var(--text-strong)]"
  );

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

  if (isMobile) {
    return (
      <div 
        className="editor-toolbar-mobile" 
        style={{ transform: `translateY(-${yOffset}px)` }}
      >
        <div className="toolbar-scroll-container">
          <div className="toolbar-inner-row flex items-center gap-2 px-1">
            {/* Group 1: Core Formatting */}
            <div className="flex items-center gap-0.5">
              <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} icon={<Bold size={18} />} title="Bold" />
              <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} icon={<Italic size={18} />} title="Italic" />
              <ToolbarButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} icon={<Underline size={18} />} title="Underline" />
              <ToolbarButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} icon={<Strikethrough size={18} />} title="Strikethrough" />
              <ToolbarButton active={editor.isActive("markerHighlight")} onClick={() => editor.chain().focus().toggleMarkerHighlight("#fef08a").run()} icon={<Highlighter size={18} />} title="Highlight" />
            </div>

            <div className="w-px h-5 bg-[var(--divider)] opacity-50" />

            {/* Group 2: Lists */}
            <div className="flex items-center gap-0.5">
              <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} icon={<List size={18} />} title="Bullet List" />
              <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} icon={<ListOrdered size={18} />} title="Numbered List" />
              <ToolbarButton active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()} icon={<CheckSquare size={18} />} title="Task List" />
            </div>

            <div className="w-px h-5 bg-[var(--divider)] opacity-50" />

            {/* Group 3: Insertions */}
            <div className="flex items-center gap-0.5">
              <ToolbarButton active={false} onClick={() => fileInputRef.current?.click()} icon={<ImageIcon size={18} />} title="Insert Image" />
              <ToolbarButton active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={<Minus size={18} />} title="Horizontal Rule" />
              <ToolbarButton active={editor.isActive("table")} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} icon={<TableIcon size={18} />} title="Insert Table" />
            </div>

            <div className="w-px h-5 bg-[var(--divider)] opacity-50" />

            {/* Group 4: Quotes & block code */}
            <div className="flex items-center gap-0.5">
              <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} icon={<Quote size={18} />} title="Blockquote" />
              <ToolbarButton active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} icon={<Code size={18} />} title="Code Block" />
            </div>

            <div className="w-px h-5 bg-[var(--divider)] opacity-50" />

            {/* Group 5: Clear Formatting & AI */}
            <div className="flex items-center gap-1.5">
              <ToolbarButton active={false} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} icon={<Eraser size={18} />} title="Clear Formatting" />

              {onAskAi && (
                <button 
                  type="button" 
                  onClick={onAskAi} 
                  onMouseDown={(e) => e.preventDefault()}
                  className={cn(toolbarButtonClass(false), "bg-[var(--accent-subtle)] text-[var(--accent-strong)] hover:bg-[var(--accent-soft)]")}
                  title="Ask AI"
                >
                  <Sparkles size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
      </div>
    );
  }

  return (
    <div className="editor-toolbar flex flex-col items-center bg-[var(--panel-bg-strong)] backdrop-blur-md border border-[var(--divider)] rounded-xl p-1 mb-4 w-fit mx-auto shadow-2xl overflow-visible">
      <div className="flex items-center gap-2 px-1.5 py-1 relative">
        
        {/* Group 1: Utilities */}
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={toggleFocusMode} onMouseDown={(e) => e.preventDefault()} className={toolbarButtonClass(isFocusMode)} title="Toggle Focus Mode">
            {isFocusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        <div className="w-px h-4 bg-[var(--divider)] opacity-50" />

        {/* Group 2: Basic Formatting */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} icon={<Bold size={16} />} title="Bold" />
          <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} icon={<Italic size={16} />} title="Italic" />
          <ToolbarButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} icon={<Underline size={16} />} title="Underline" />
          <ToolbarButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} icon={<Strikethrough size={16} />} title="Strikethrough" />
          <ToolbarButton active={editor.isActive("markerHighlight")} onClick={() => editor.chain().focus().toggleMarkerHighlight("#fef08a").run()} icon={<Highlighter size={16} />} title="Highlight" />
        </div>

        <div className="w-px h-4 bg-[var(--divider)] opacity-50" />

        {/* Group 3: Lists */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} icon={<List size={16} />} title="Bullet List" />
          <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} icon={<ListOrdered size={16} />} title="Numbered List" />
          <ToolbarButton active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()} icon={<CheckSquare size={16} />} title="Task List" />
        </div>

        <div className="w-px h-4 bg-[var(--divider)] opacity-50" />

        {/* Group 4: Insertions */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton active={false} onClick={() => fileInputRef.current?.click()} icon={<ImageIcon size={16} />} title="Insert Image" />
          <ToolbarButton active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={<Minus size={16} />} title="Horizontal Rule" />
          <ToolbarButton active={editor.isActive("table")} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} icon={<TableIcon size={16} />} title="Insert Table" />
        </div>

        <div className="w-px h-4 bg-[var(--divider)] opacity-50" />

        {/* Group 5: Blocks */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} icon={<Quote size={16} />} title="Blockquote" />
          <ToolbarButton active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} icon={<Code size={16} />} title="Code Block" />
        </div>

        <div className="w-px h-4 bg-[var(--divider)] opacity-50" />

        {/* Group 6: Cleanup & AI */}
        <div className="flex items-center gap-1">
          <ToolbarButton active={false} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} icon={<Eraser size={16} />} title="Clear Formatting" />
          
          {onAskAi && (
            <button 
              type="button" 
              onClick={onAskAi} 
              onMouseDown={(e) => e.preventDefault()}
              className={cn(toolbarButtonClass(false), "bg-[var(--accent-subtle)] text-[var(--accent-strong)] hover:bg-[var(--accent-soft)]")}
              title="Ask AI"
            >
              <Sparkles size={16} />
            </button>
          )}
        </div>
      </div>

      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
    </div>
  );
};


const ToolbarButton = ({ active, onClick, icon, title, className }: { active: boolean, onClick: () => void, icon: React.ReactNode, title: string, className?: string }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()}
    className={cn(
      "flex items-center justify-center rounded-md p-1.5 transition-colors focus:outline-none",
      active ? "bg-[var(--active-surface)] text-[var(--accent-strong)] shadow-sm" : "text-[var(--muted-text)] hover:bg-[var(--surface-ghost)] hover:text-[var(--text-strong)]",
      className
    )}
  >
    {icon}
  </button>
);

export default EditorToolbar;
