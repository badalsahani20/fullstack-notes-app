import React from "react";
import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  Bold, Italic,
  Underline, Strikethrough, Highlighter,
  Heading1, Heading2, List, ListOrdered, Quote, Code, Terminal,
  Sparkles, Loader2, MoreHorizontal, ChevronDown, Eraser, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiAction } from "@/components/ai/types";

type Props = {
  editor: Editor;
  onAction?: (action: AiAction) => void;
  loadingAction?: AiAction | null;
  onAskAi?: (selectedText: string, startLine: number, endLine: number) => void;
};

// ── Curated marker palette ──────────────────────────────────────
const MARKER_COLORS = [
  { color: "#fef08a", label: "Yellow" },
  { color: "#86efac", label: "Green" },
  { color: "#93c5fd", label: "Blue" },
  { color: "#f9a8d4", label: "Pink" },
  { color: "#fca5a5", label: "Red" },
  { color: "#fdba74", label: "Orange" },
  { color: "#c4b5fd", label: "Purple" },
  { color: "#a5f3fc", label: "Cyan" },
];

const MORE_ITEMS = [
  { label: "Underline", icon: <Underline size={13} />, run: (e: Editor) => e.chain().focus().toggleUnderline().run(), active: (e: Editor) => e.isActive("underline") },
  { label: "Strike", icon: <Strikethrough size={13} />, run: (e: Editor) => e.chain().focus().toggleStrike().run(), active: (e: Editor) => e.isActive("strike") },
  { label: "H1", icon: <Heading1 size={13} />, run: (e: Editor) => e.chain().focus().toggleHeading({ level: 1 }).run(), active: (e: Editor) => e.isActive("heading", { level: 1 }) },
  { label: "H2", icon: <Heading2 size={13} />, run: (e: Editor) => e.chain().focus().toggleHeading({ level: 2 }).run(), active: (e: Editor) => e.isActive("heading", { level: 2 }) },
  { label: "Bullet List", icon: <List size={13} />, run: (e: Editor) => e.chain().focus().toggleBulletList().run(), active: (e: Editor) => e.isActive("bulletList") },
  { label: "Numbered List", icon: <ListOrdered size={13} />, run: (e: Editor) => e.chain().focus().toggleOrderedList().run(), active: (e: Editor) => e.isActive("orderedList") },
  { label: "Quote", icon: <Quote size={13} />, run: (e: Editor) => e.chain().focus().toggleBlockquote().run(), active: (e: Editor) => e.isActive("blockquote") },
  { label: "Inline Code", icon: <Code size={13} />, run: (e: Editor) => e.chain().focus().toggleCode().run(), active: (e: Editor) => e.isActive("code") },
  { label: "Code Block", icon: <Terminal size={13} />, run: (e: Editor) => e.chain().focus().toggleCodeBlock().run(), active: (e: Editor) => e.isActive("codeBlock") },
  { label: "Clear Format", icon: <Eraser size={13} />, run: (e: Editor) => e.chain().focus().unsetAllMarks().clearNodes().run(), active: () => false, isDanger: true },
];

import { useEditorUIStore } from "@/store/useEditorUIStore";

const EditorBubbleMenu = ({ editor, onAction, loadingAction, onAskAi }: Props) => {
  const [showMore, setShowMore] = React.useState(false);
  const [showMarker, setShowMarker] = React.useState(false);

  const { markerColor, setMarkerColor } = useEditorUIStore();

  const moreRef = React.useRef<HTMLDivElement>(null);
  const markerRef = React.useRef<HTMLDivElement>(null);

  // Close flyouts when selection collapses natively
  React.useEffect(() => {
    if (editor.state.selection.empty) {
      setShowMore(false);
    }
  }, [editor.state.selection.empty]);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setShowMore(false);
      if (markerRef.current && !markerRef.current.contains(e.target as Node)) setShowMarker(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isHighlightActive = editor.isActive("markerHighlight");

  function applyColor(color: string) {
    setMarkerColor(color);
    editor.chain().focus().setMarkerHighlight(color).run();
    setShowMarker(false);
  }

  function closeMarker() {
    setShowMarker(false);
  }

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="standardBubbleMenu"
      shouldShow={({ editor }) => {
        if (showMarker || showMore) return true;
        return !editor.isActive("aiGhostText") && !editor.state.selection.empty;
      }}
      options={{
        placement: "bottom",
        offset: { mainAxis: 10 },
        shift: true,
        flip: true,
      }}
      className="bubble-command-bar z-[80]"
    >
      {/* ─── Single Row ─── */}
      <div className="bubble-row">

        {/* Left cluster: B · I · Marker */}
        <div className="bubble-cluster">
          <FmtButton
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            icon={<Bold size={13} />}
            label="Bold"
          />
          <FmtButton
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            icon={<Italic size={13} />}
            label="Italic"
          />

          {/* Marker button with color swatch flyout */}
          <div className="relative" ref={markerRef}>
            <div className="flex items-center gap-[2px]">
              {/* Primary toggle button */}
              <button
                type="button"
                aria-label="Highlight"
                title="Highlight"
                onClick={() => {
                  editor.chain().focus().toggleMarkerHighlight(markerColor).run();
                }}
                className={cn("bubble-fmt-btn bubble-marker-btn", isHighlightActive && "bubble-fmt-btn-active")}
              >
                <Highlighter size={13} />
                {/* Active colour dot */}
                <span
                  className="bubble-marker-dot"
                  style={{ background: markerColor }}
                />
              </button>

              {/* Flyout trigger */}
              <button
                type="button"
                aria-label="Colors"
                title="Color Options"
                onClick={() => {
                  setShowMarker(v => !v);
                  setShowMore(false);
                }}
                className="bubble-fmt-btn px-1 ml-[-2px] !min-w-[16px]"
              >
                <ChevronDown size={11} className="opacity-60" />
              </button>
            </div>

            {/* Color swatch flyout */}
            {showMarker && (
              <div className="bubble-marker-flyout">
                <div className="bubble-marker-flyout-header">
                  <span>Highlight colour</span>
                  <button type="button" onClick={closeMarker} className="bubble-marker-close">
                    <X size={11} />
                  </button>
                </div>

                {/* Preset swatches */}
                <div className="bubble-marker-swatches">
                  {MARKER_COLORS.map(({ color, label }) => (
                    <button
                      key={color}
                      type="button"
                      title={label}
                      aria-label={label}
                      onClick={() => applyColor(color)}
                      className={cn(
                        "bubble-marker-swatch",
                        markerColor === color && "bubble-marker-swatch-active"
                      )}
                      style={{ background: color }}
                    />
                  ))}
                </div>

                {/* Remove highlight */}
                {isHighlightActive && (
                  <button
                    type="button"
                    className="bubble-marker-remove"
                    onClick={() => {
                      editor.chain().focus().unsetMark("markerHighlight").run();
                      setShowMarker(false);
                    }}
                  >
                    <X size={11} />
                    Remove highlight
                  </button>
                )}

              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="bubble-divider" />

        {/* Ask AI selection button */}
        <button
          type="button"
          onClick={() => {
            const { from, to } = editor.state.selection;
            const selectedText = editor.state.doc.textBetween(from, to, "\n");
            const textBeforeSelection = editor.state.doc.textBetween(0, from, "\n");
            const startLine = textBeforeSelection.split("\n").length;
            const endLine = startLine + selectedText.split("\n").length - 1;
            onAskAi?.(selectedText, startLine, endLine);
          }}
          className="bubble-ai-primary"
          title="Ask Iris about this selection"
        >
          <span>Ask Iris</span>
        </button>

        {/* More ⋯ */}
        <div className="relative" ref={moreRef}>
          <button
            type="button"
            onClick={() => { setShowMore(v => !v); setShowMarker(false); }}
            className={cn("bubble-more", showMore && "bubble-more-open")}
            title="More formatting"
            aria-label="More options"
          >
            <MoreHorizontal size={14} />
          </button>

          {showMore && (
            <div className="bubble-dropdown bubble-dropdown-right">
              {MORE_ITEMS.map((item, idx) => {
                const isActive = item.active(editor);
                const isDivider = idx === MORE_ITEMS.length - 1;
                return (
                  <React.Fragment key={item.label}>
                    {isDivider && <div className="bubble-menu-separator" />}
                    <button
                      type="button"
                      onClick={() => { item.run(editor); setShowMore(false); }}
                      className={cn(
                        "bubble-dropdown-item",
                        isActive && "bubble-dropdown-item-active",
                        (item as any).isDanger && "bubble-dropdown-item-danger"
                      )}
                    >
                      <span className="bubble-dropdown-item-icon">{item.icon}</span>
                      {item.label}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </BubbleMenu>
  );
};

/* ─── Micro-component: formatting icon button ─── */
const FmtButton = ({
  active, onClick, icon, label,
}: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    aria-label={label}
    className={cn("bubble-fmt-btn", active && "bubble-fmt-btn-active")}
  >
    {icon}
  </button>
);

export default EditorBubbleMenu;
