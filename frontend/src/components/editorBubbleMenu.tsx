import React from "react";
import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { 
  Bold, Italic, Underline, Strikethrough, Highlighter, Link as LinkIcon,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code, Terminal, 
  Sparkles, FileText, HelpCircle, ArrowRight, Loader2, MoreVertical, Eraser
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiAction } from "@/components/ai/types";

type Props = {
  editor: Editor;
  onAction?: (action: AiAction) => void;
  loadingAction?: AiAction | null;
};

const EditorBubbleMenu = ({ editor, onAction, loadingAction }: Props) => {
  const [showMore, setShowMore] = React.useState(false);

  // Close overflow menu when bubble menu hides
  React.useEffect(() => {
    if (editor.state.selection.empty) {
      setShowMore(false);
    }
  }, [editor.state.selection.empty]);

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="standardBubbleMenu"
      shouldShow={({ editor }) => {
        return !editor.isActive("aiGhostText") && !editor.state.selection.empty;
      }}
      options={{
        placement: "bottom",
        offset: { mainAxis: 10 },
        shift: true,
        flip: true,
      }}
      className="z-[80] flex flex-col overflow-visible rounded-xl border border-white/10 bg-[#0f172a]/95 shadow-2xl backdrop-blur-md min-w-[280px]"
    >
      {/* Top Row: Essentials */}
      <div className="flex items-center flex-wrap gap-0.5 p-1 border-b border-white/5 bg-white/[0.02]">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          icon={<Bold size={14} />}
          label="Bold"
        />
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          icon={<Italic size={14} />}
          label="Italic"
        />
        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          icon={<Underline size={14} />}
          label="Underline"
        />
        <ToolbarButton
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          icon={<Strikethrough size={14} />}
          label="Strike"
        />
        <ToolbarButton
          active={editor.isActive("markerHighlight")}
          onClick={() => editor.chain().focus().toggleMarkerHighlight("#fef08a").run()}
          icon={<Highlighter size={14} />}
          label="Highlight"
        />
        <ToolbarButton
          active={editor.isActive("link")}
          onClick={() => {
            const url = window.prompt("URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          icon={<LinkIcon size={14} />}
          label="Link"
        />
        
        <div className="mx-1 h-3 w-px bg-white/10" />
        
        <ToolbarButton
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          icon={<Heading1 size={14} />}
          label="H1"
        />
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          icon={<Heading2 size={14} />}
          label="H2"
        />
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icon={<List size={14} />}
          label="Bullet List"
        />

        {/* Custom Overflow Toggle */}
        <div className="relative">
          <button 
            type="button"
            onClick={() => setShowMore(!showMore)}
            title="More Options"
            className={cn(
              "flex items-center justify-center rounded-md p-1.5 transition-colors focus:outline-none",
              showMore ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
            )}
          >
            <MoreVertical size={14} />
          </button>

          {showMore && (
            <div className="absolute right-0 top-full z-[100] mt-2 w-48 overflow-hidden rounded-lg border border-white/10 bg-[#1e293b] p-1 shadow-2xl animate-in fade-in slide-in-from-top-1">
              <OverflowItem 
                active={editor.isActive("heading", { level: 3 })}
                onClick={() => { editor.chain().focus().toggleHeading({ level: 3 }).run(); setShowMore(false); }}
                icon={<Heading3 size={14} />}
                label="H3 Heading"
              />
              <OverflowItem 
                active={editor.isActive("orderedList")}
                onClick={() => { editor.chain().focus().toggleOrderedList().run(); setShowMore(false); }}
                icon={<ListOrdered size={14} />}
                label="Numbered List"
              />
              <OverflowItem 
                active={editor.isActive("blockquote")}
                onClick={() => { editor.chain().focus().toggleBlockquote().run(); setShowMore(false); }}
                icon={<Quote size={14} />}
                label="Quote"
              />
              <OverflowItem 
                active={editor.isActive("code")}
                onClick={() => { editor.chain().focus().toggleCode().run(); setShowMore(false); }}
                icon={<Code size={14} />}
                label="Inline Code"
              />
              <OverflowItem 
                active={editor.isActive("codeBlock")}
                onClick={() => { editor.chain().focus().toggleCodeBlock().run(); setShowMore(false); }}
                icon={<Terminal size={14} />}
                label="Code Block"
              />
              <div className="my-1 border-t border-white/10" />
              <OverflowItem 
                onClick={() => { editor.chain().focus().unsetAllMarks().clearNodes().run(); setShowMore(false); }}
                icon={<Eraser size={14} />}
                label="Clear Format"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: AI Actions */}
      <div className="flex flex-col p-1.5 bg-white/[0.04]">
        <div className="px-2 py-1 text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles size={10} className="text-[var(--accent-strong)]" />
          AI Writing Assistant
        </div>
        <div className="grid grid-cols-2 gap-1 mt-0.5">
          <AiActionButton
            label="Improve"
            icon={<Sparkles size={13} />}
            isLoading={loadingAction === "grammar"}
            onClick={() => onAction?.("grammar")}
            disabled={!!loadingAction}
          />
          <AiActionButton
            label="Summarize"
            icon={<FileText size={13} />}
            isLoading={loadingAction === "summarize"}
            onClick={() => onAction?.("summarize")}
            disabled={!!loadingAction}
          />
          <AiActionButton
            label="Explain"
            icon={<HelpCircle size={13} />}
            isLoading={loadingAction === "explain"}
            onClick={() => onAction?.("explain")}
            disabled={!!loadingAction}
          />
          <AiActionButton
            label="Continue"
            icon={<ArrowRight size={13} />}
            isLoading={loadingAction === "continue"}
            onClick={() => onAction?.("continue")}
            disabled={!!loadingAction}
          />
        </div>
      </div>
    </BubbleMenu>
  );
};

const ToolbarButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    title={label}
    className={cn(
      "rounded-md p-1.5 transition-colors",
      active
        ? "bg-white/10 text-[var(--accent-strong)]"
        : "text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
    )}
  >
    {icon}
  </button>
);

const OverflowItem = ({ active, onClick, icon, label }: { active?: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex w-full items-center gap-2.5 px-2 py-1.5 cursor-pointer rounded-md outline-none transition-colors",
      active ? "bg-white/10 text-[var(--accent-strong)]" : "text-zinc-300 hover:bg-white/5 hover:text-white"
    )}
  >
    <span className="text-zinc-400">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const AiActionButton = ({ 
  label, icon, isLoading, onClick, disabled 
}: { 
  label: string, icon: React.ReactNode, isLoading: boolean, onClick: () => void, disabled: boolean 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-2 rounded-md px-2 py-1 text-[12px] font-medium text-zinc-300 hover:bg-white/10 hover:text-[var(--accent-strong)] transition-all disabled:opacity-30"
  >
    <span className="flex-shrink-0 text-[10px]">
      {isLoading ? <Loader2 size={12} className="animate-spin text-[var(--accent-strong)]" /> : icon}
    </span>
    {label}
  </button>
);

export default EditorBubbleMenu;
