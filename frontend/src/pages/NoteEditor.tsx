import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  const location = useLocation();
  const navigate = useNavigate();
  const { notes, archivedNotes, fetchNotes, fetchArchived, updateNote, togglePinning, toggleArchive } = useNoteStore();
  const { folders } = useFolderStore();

  const note = [...notes, ...archivedNotes].find((n) => n?._id === noteId);
  const folder = folders.find((item) => item._id === (note?.folder || folderId));
  const [draftTitle, setDraftTitle] = useState("");
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 960);

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
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 960);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (note) return;
    void fetchNotes(folderId || null);
    void fetchArchived();
  }, [fetchArchived, fetchNotes, folderId, note]);

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

  const handleToggleArchive = async (id: string) => {
    const updatedNote = await toggleArchive(id);
    if (!updatedNote) return;

    if (updatedNote.isArchived) {
      navigate(`/archive/note/${id}${location.search}`, { replace: true });
      return;
    }

    if (updatedNote.folder) {
      navigate(`/folders/${updatedNote.folder}/note/${id}${location.search}`, { replace: true });
      return;
    }

    navigate(`/note/${id}${location.search}`, { replace: true });
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
        onToggleArchive={handleToggleArchive}
      />

      <div className="editor-workspace custom-scrollbar flex-1 overflow-y-auto px-8 pb-8 pt-4 custom-scrollbar">
        <TipTap key={note._id} content={note.content} onChange={handleContentChange} onEditorReady={setEditorInstance} onAskAi={() => setAiOpen(true)} />
      </div>
    </section>
  );

  return (
    <div className="flex h-full min-h-0">
      {aiOpen && isMobile ? (
        <>
          {editorPane}
          <div className="assistant-mobile-overlay">
            <AiAuditPanel
              noteId={note._id}
              noteContent={note.content}
              editor={editorInstance}
              onClose={() => setAiOpen(false)}
              mobileMode
            />
          </div>
        </>
      ) : aiOpen ? (
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
