import { ChevronRight, X } from "lucide-react";

type NotesPanelHeaderProps = {
  breadcrumbRoot: string;
  panelTitle: string;
  currentFolderName: string | null;
  isFocusMode: boolean;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
};

const NotesPanelHeader = ({
  breadcrumbRoot,
  panelTitle,
  currentFolderName,
  isFocusMode,
  actionLabel,
  onAction,
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

      <div className="flex items-center gap-2">
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="rounded-md border border-[var(--border-soft)] px-2.5 py-1 text-xs font-medium text-[var(--muted-text)] transition hover:bg-[var(--surface-ghost)] hover:text-[var(--text-strong)]"
          >
            {actionLabel}
          </button>
        ) : null}

        {isFocusMode ? (
          <button
            type="button"
            onClick={onClose}
            className="desktop-icon-button bg-transparent border-transparent hover:bg-[var(--surface-ghost)]"
            style={{ width: "1.8rem", height: "1.8rem", color: "var(--muted-text)" }}
            title="Close Note List"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default NotesPanelHeader;
