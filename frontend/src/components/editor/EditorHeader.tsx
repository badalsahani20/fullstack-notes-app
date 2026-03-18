import { Sparkles, Star } from "lucide-react";
import RelativeTimeLabel from "./RelativeTimeLabel";
import type { Note } from "@/store/useNoteStore";
import type { Folder } from "@/store/useFolderStore";

type EditorHeaderProps = {
  note: Note;
  /** Found folder for the note (if any), strictly for displaying its name */
  folder?: Folder;
  /** The controlled text input value for the title */
  draftTitle: string;
  onDraftTitleChange: (title: string) => void;
  /** Called on blur to commit the title if changed */
  onCommitTitle: () => void;
  onTogglePin: (id: string) => void;
  onAskAi: () => void;
};

/**
 * Top header of the note editor page.
 * Contains: Title input, Star button, Ask AI button, and the Meta row (folder + time).
 */
const EditorHeader = ({
  note,
  folder,
  draftTitle,
  onDraftTitleChange,
  onCommitTitle,
  onTogglePin,
  onAskAi,
}: EditorHeaderProps) => {
  return (
    <div className="desktop-editor-header">
      <div className="editor-title-row">
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

        <button
          type="button"
          onClick={() => onTogglePin(note._id)}
          className={`editor-star-toggle ${note.pinned ? "editor-star-toggle-active" : ""}`}
        >
          <Star size={15} fill={note.pinned ? "currentColor" : "none"} />
          {note.pinned ? "Starred" : "Starred"}
        </button>
        <button type="button" onClick={onAskAi} className="editor-ask-ai-button">
          <Sparkles size={15} />
          Ask AI
        </button>
      </div>

      <div className="editor-title-meta">
        <span>{folder?.name || "AI Notes"}</span>
        <RelativeTimeLabel updatedAt={note.updatedAt} />
      </div>
    </div>
  );
};

export default EditorHeader;
