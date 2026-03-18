import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import debounce from "lodash.debounce";
import type { Editor } from "@tiptap/react";
import { useNoteStore } from "@/store/useNoteStore";
import { useFolderStore } from "@/store/useFolderStore";
import TipTap from "@/components/TipTap";
import AiAuditPanel from "@/components/AiAuditPanel";
import EmptyEditorState from "@/components/EmptyEditorState";
import EditorHeader from "@/components/editor/EditorHeader";
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
      <EditorHeader
        note={note}
        folder={folder}
        draftTitle={draftTitle}
        onDraftTitleChange={setDraftTitle}
        onCommitTitle={commitTitle}
        onTogglePin={togglePinning}
        onAskAi={() => setAiOpen(true)}
      />

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


export default NoteEditor;
