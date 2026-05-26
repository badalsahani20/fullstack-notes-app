import React from "react";
import type { Editor } from "@tiptap/react";
import { Archive, Star, BookOpen, ChevronLeft, Share2, MoreHorizontal, Loader2 } from "lucide-react";
import type { AiAction } from "@/components/ai/types";
import { EditorStats } from "./EditorStats";
import { ShareModal } from "./ShareModal";
import type { Note } from "@/store/useNoteStore";
import type { Folder } from "@/store/useFolderStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type EditorHeaderProps = {
  note: Note;
  /** Found folder for the note (if any), strictly for displaying its name */
  folder?: Folder;
  folderLabel?: string;
  editor: Editor | null;
  /** The controlled text input value for the title */
  draftTitle: string;
  onDraftTitleChange: (title: string) => void;
  /** Called on blur to commit the title if changed */
  onCommitTitle: () => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onAskAi?: () => void;
  onAskAiHover?: () => void;
  isAiOpen?: boolean;
  onStudy?: () => void;
  isStudyOpen?: boolean;
  isMobile?: boolean;
  isSaving?: boolean;
  loadingAction?: AiAction | null;
  onRunAction?: (action: AiAction) => Promise<void>;
  onOpenGenerateNotes?: () => void;
};


/**
 * Top header of the note editor page.
 * Desktop: shows all actions inline.
 * Mobile: collapses Share / Archive / Star into a "⋯" overflow menu.
 */
const EditorHeader = ({
  note,
  folder,
  folderLabel,
  editor,
  draftTitle,
  onDraftTitleChange,
  onCommitTitle,
  onTogglePin,
  onToggleArchive,
  onAskAi,
  onAskAiHover,
  isAiOpen,
  onStudy,
  isStudyOpen,
  isMobile,
  isSaving,
  loadingAction,
  onOpenGenerateNotes,
}: EditorHeaderProps) => {

  const [isShareOpen, setIsShareOpen] = React.useState(false);

  return (
    <div className="desktop-editor-header">
      <div className="editor-title-row">
        <div className="flex flex-1 items-center min-w-0">
          {isMobile && (
            <button
              type="button"
              onClick={() => window.history.back()}
              className="mr-1 -ml-2 p-1.5 rounded-full hover:bg-white/5 active:bg-white/10 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft size={20} className="text-[var(--text-strong)]" />
            </button>
          )}
          <input
            className="editor-title-input"
            value={draftTitle}
            placeholder="Untitled Note"
            onChange={(e) => onDraftTitleChange(e.target.value)}
            onBlur={onCommitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.currentTarget as HTMLInputElement).blur();
              }
            }}
          />
        </div>

        <div className="editor-meta-stack">
          {/* Generate Notes button — desktop only */}
          {!isMobile && (
            <button
              type="button"
              onClick={onOpenGenerateNotes}
              className="ignite-button h-7 !px-3 text-[0.8rem]"
              aria-label="Generate notes with Iris"
            >
              <div className="iris-orb shrink-0" style={{ width: "12px", height: "12px", borderWidth: "1px", boxShadow: "none" }} />
              <span className="hidden sm:inline">Generate Notes</span>
            </button>
          )}

          {/* Study button — desktop only */}
          {!isMobile && (
            <button
              type="button"
              onClick={onStudy}
              className={`ignite-button h-7 !px-3 text-[0.8rem] ${
                isStudyOpen
                  ? "nav-action-btn-active !bg-[var(--study-accent-soft)] !text-[var(--study-accent)] !border-[color-mix(in_srgb,var(--study-accent)_25%,transparent)]"
                  : ""
              }`}
              aria-label="Toggle Study Mode"
              id="study-mode-btn"
            >
              <BookOpen size={14} />
              <span className="hidden sm:inline">Study</span>
            </button>
          )}

          {/* AI button — always visible */}
          {!isMobile && (
            <button
              type="button"
              onClick={onAskAi}
              onMouseEnter={onAskAiHover}
              onFocus={onAskAiHover}
              className={`ignite-button h-7 !px-3 text-[0.8rem] ${isAiOpen ? "nav-action-btn-active" : ""}`}
              aria-label="Toggle Iris AI Assistant"
            >
              {loadingAction ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <div className="iris-orb shrink-0" style={{ width: "12px", height: "12px", borderWidth: "1px", boxShadow: "none" }} />
              )}
              <span className="hidden sm:inline">{loadingAction ? "Thinking..." : "Iris"}</span>
            </button>
          )}

          {/* Unified expandable menu (Star, Archive, Share) for all screens */}
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="editor-star-toggle flex items-center justify-center rounded-lg p-1.5 hover:bg-white/5 active:bg-white/10 transition-colors"
                  aria-label="More actions"
                >
                  <MoreHorizontal size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-[var(--panel-bg-strong)] border-[var(--divider)] text-[var(--text-strong)] shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
              >
                <DropdownMenuItem
                  onSelect={() => setIsShareOpen(true)}
                  className="cursor-pointer text-[13px] text-[var(--text-main)] focus:bg-[var(--surface-ghost)] focus:text-[var(--text-strong)] gap-2.5"
                >
                  <Share2 size={14} className={note.isShared ? "text-[var(--accent-strong)]" : "opacity-40"} />
                  {note.isShared ? "Sharing (on)" : "Share note"}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-[var(--divider)]" />

                <DropdownMenuItem
                  onSelect={() => onTogglePin(note._id)}
                  className="cursor-pointer text-[13px] text-[var(--text-main)] focus:bg-[var(--surface-ghost)] focus:text-[var(--text-strong)] gap-2.5"
                >
                  <Star
                    size={14}
                    fill={note.pinned ? "currentColor" : "none"}
                    className={note.pinned ? "text-amber-400" : "opacity-40"}
                  />
                  {note.pinned ? "Starred" : "Star note"}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => onToggleArchive(note._id)}
                  className="cursor-pointer text-[13px] text-[var(--text-main)] focus:bg-[var(--surface-ghost)] focus:text-[var(--text-strong)] gap-2.5"
                >
                  <Archive size={14} className={note.isArchived ? "text-[var(--accent-strong)]" : "opacity-40"} />
                  {note.isArchived ? "Unarchive" : "Archive note"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="editor-title-meta">
        <span className="editor-folder-label flex items-center gap-1.5 leading-none">
          {(folderLabel ?? folder?.name ?? "All Notes") === "AI Notes" && (
            <div className="iris-orb shrink-0" style={{ width: "10px", height: "10px", borderWidth: "1px", boxShadow: "none" }} />
          )}
          {folderLabel ?? folder?.name ?? "All Notes"}
        </span>
        <EditorStats editor={editor} isSaving={isSaving} />
      </div>

      <ShareModal
        note={note}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
};

export default React.memo(EditorHeader);
