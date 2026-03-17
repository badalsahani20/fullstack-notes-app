import { useEffect, useMemo, useState } from "react";
import { Sparkles, Star } from "lucide-react";
import { useParams } from "react-router-dom";
import debounce from "lodash.debounce";
import type { Editor } from "@tiptap/react";
import { useNoteStore } from "@/store/useNoteStore";
import { useFolderStore } from "@/store/useFolderStore";
import TipTap from "@/components/TipTap";
import AiAuditPanel from "@/components/AiAuditPanel";
import EmptyEditorState from "@/components/EmptyEditorState";
import { getRelativeUpdatedLabel } from "@/utils/getRelativeUpdatedLabel";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const NoteEditor = () => {
  const { noteId, folderId } = useParams();
  const { notes, updateNote, togglePinning } = useNoteStore();
  const { folders } = useFolderStore();

  const note = notes.find((n) => n?._id === noteId);
  const folder = folders.find((item) => item._id === (note?.folder || folderId));
  const [draftTitle, setDraftTitle] = useState("");
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

  const debouncedUpdate = useMemo(
    () =>
      debounce((id: string, content: string) => {
        updateNote(id, { content });
      }, 600),
    [updateNote]
  );

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  useEffect(() => {
    setDraftTitle(note?.title ?? "");
  }, [note?._id, note?.title]);

  useEffect(() => {
    setDraftTitle(note?.title ?? "");
  }, [note?._id, note?.title]);

  const handleContentChange = (html: string) => {
    if (note) {
      debouncedUpdate(note._id, html);
    }
  };

  const commitTitle = () => {
    if (!note) return;
    if (draftTitle !== note.title) {
      updateNote(note._id, { title: draftTitle });
    }
  };

  if (!note) {
    return <EmptyEditorState />;
  }

  const editorPane = (
    <section className="flex min-w-0 flex-1 flex-col">
      <div className="desktop-editor-header">
        <div className="editor-title-row">
          <input
            className="editor-title-input"
            value={draftTitle}
            placeholder="Untitled Note"
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.currentTarget as HTMLInputElement).blur();
              }
            }}
          />

          <button
            type="button"
            onClick={() => togglePinning(note._id)}
            className={`editor-star-toggle ${note.pinned ? "editor-star-toggle-active" : ""}`}
          >
            <Star size={15} fill={note.pinned ? "currentColor" : "none"} />
            {note.pinned ? "Starred" : "Starred"}
          </button>
          <button type="button" onClick={() => setAiOpen(true)} className="editor-ask-ai-button">
            <Sparkles size={15} />
            Ask AI
          </button>
        </div>

        <div className="editor-title-meta">
          <span>{folder?.name || "AI Notes"}</span>
          <RelativeTimeLabel updatedAt={note.updatedAt} />
        </div>
      </div>

      <div className="editor-workspace custom-scrollbar flex-1 overflow-y-auto px-8 pb-8 pt-4 custom-scrollbar">
        <TipTap key={note._id} content={note.content} onChange={handleContentChange} onEditorReady={setEditorInstance} />
      </div>
    </section>
  );

  return (
    <div className="flex h-full min-h-0">
      {aiOpen ? (
        <ResizablePanelGroup orientation="horizontal" className="h-full min-h-0">
          <ResizablePanel minSize="0" className="min-w-0 h-full">
            {editorPane}
          </ResizablePanel>
          <ResizableHandle withHandle className="assistant-resize-handle" />
          <ResizablePanel
            defaultSize="20rem"
            minSize="20rem"
            maxSize="23rem"
            className="assistant-panel-shell h-full"
          >
            <AiAuditPanel noteId={note._id} noteContent={note.content} editor={editorInstance} onClose={() => setAiOpen(false)} />
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        editorPane
      )}
    </div>
  );
};

const RelativeTimeLabel = ({ updatedAt }: { updatedAt: string }) => {
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return <span>{getRelativeUpdatedLabel(updatedAt, nowMs)}</span>;
};

export default NoteEditor;
