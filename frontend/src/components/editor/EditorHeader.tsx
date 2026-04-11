import type { Editor } from "@tiptap/react";
import { Archive, Star, Sparkles, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import RelativeTimeLabel from "./RelativeTimeLabel";
import type { Note } from "@/store/useNoteStore";
import type { Folder } from "@/store/useFolderStore";
import EditorToolbar from "@/tools/EditorToolbar";

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
  isAiOpen?: boolean;
  isMobile?: boolean;
};


/**
 * Top header of the note editor page.
 * Contains: Title input, Star button, Ask AI button, and the Meta row (folder + time).
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
  isAiOpen,
  isMobile,
}: EditorHeaderProps) => {

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
          <button
            type="button"
            onClick={() => onToggleArchive(note._id)}
            className={`editor-star-toggle ${note.isArchived ? "editor-archive-toggle-active" : ""}`}
            aria-label={note.isArchived ? "Unarchive note" : "Archive note"}
          >
            <Archive size={15} />
            <span className="hidden md:inline">{note.isArchived ? "Archived" : "Archive"}</span>
          </button>
          <button
            type="button"
            onClick={() => onTogglePin(note._id)}
            className={`editor-star-toggle ${note.pinned ? "editor-star-toggle-active" : ""}`}
            aria-label={note.pinned ? "Remove from favorites" : "Add to favorites"}
          >
            <motion.div
              key={note.pinned ? "pinned" : "unpinned"}
              initial={{ scale: 0.5, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.2, rotate: 15 }}
              whileTap={{ scale: 0.8, rotate: -15 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex items-center justify-center p-0.5"
            >
              <Star size={16} fill={note.pinned ? "currentColor" : "none"} strokeWidth={note.pinned ? 2 : 1.5} />
            </motion.div>
            <span className="hidden md:inline">{note.pinned ? "Starred" : "Star"}</span>
          </button>
          
          <button
            type="button"
            onClick={onAskAi}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              isAiOpen 
                ? "bg-[var(--accent-strong)] text-white shadow-md shadow-[var(--accent-strong)]/20" 
                : "bg-[var(--accent-subtle)] text-[var(--accent-strong)] hover:bg-[var(--accent-soft)]"
            }`}
            aria-label="Toggle AI Assistant"
          >
            <Sparkles size={15} className={isAiOpen ? "animate-pulse" : ""} />
            <span className="hidden md:inline">Ask AI</span>
          </button>
          <div className="editor-updated-mobile md:hidden">
            <RelativeTimeLabel updatedAt={note.updatedAt} />
          </div>
        </div>
      </div>


      <div className="editor-title-meta">
        <span className="editor-folder-label flex items-center gap-1.5 leading-none">
          {(folderLabel ?? folder?.name ?? "All Notes") === "AI Notes" && (
            <Sparkles size={12} className="text-[var(--accent-strong)]" />
          )}
          {folderLabel ?? folder?.name ?? "All Notes"}
        </span>
        <RelativeTimeLabel updatedAt={note.updatedAt} />
      </div>

      {editor && !isMobile ? <EditorToolbar editor={editor} /> : null}
    </div>

  );
};

export default EditorHeader;
