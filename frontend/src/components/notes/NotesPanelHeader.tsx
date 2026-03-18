import { ChevronRight, X } from "lucide-react";

type NotesPanelHeaderProps = {
  /** e.g. "All Notes", "Favorites", "AI Notes" */
  breadcrumbRoot: string;
  /** The active folder/section name shown after the chevron */
  panelTitle: string;
  /** Non-null when inside a folder — triggers the chevron separator */
  currentFolderName: string | null;
  /** True when the panel is in focus mode — shows the close button */
  isFocusMode: boolean;
  onClose: () => void;
};

/**
 * The top header row of the notes list panel.
 * Shows a breadcrumb trail and, in focus mode, a close button.
 *
 * Breadcrumb logic:
 *   "All Notes"                 — when on the root
 *   "AI Notes  >  My Folder"   — when inside a folder
 *   "Favorites"                — when on the favorites route
 */
const NotesPanelHeader = ({
  breadcrumbRoot,
  panelTitle,
  currentFolderName,
  isFocusMode,
  onClose,
}: NotesPanelHeaderProps) => {
  return (
    <div className="notes-panel-header flex items-center justify-between pr-2">
      <div className="notes-panel-breadcrumb">
        <span>{breadcrumbRoot}</span>
        {currentFolderName ? (
          <>
            <ChevronRight size={14} />
            <span className="notes-panel-breadcrumb-active">{panelTitle}</span>
          </>
        ) : null}
      </div>

      {isFocusMode && (
        <button
          type="button"
          onClick={onClose}
          className="desktop-icon-button bg-transparent border-transparent hover:bg-[var(--surface-ghost)]"
          style={{ width: "1.8rem", height: "1.8rem", color: "var(--muted-text)" }}
          title="Close Note List"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};

export default NotesPanelHeader;
