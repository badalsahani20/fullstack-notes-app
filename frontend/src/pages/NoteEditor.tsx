import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import debounce from "lodash.debounce";
import type { Editor } from "@tiptap/react";
import { useFolderStore } from "@/store/useFolderStore";
import { useNoteQuery } from "@/hooks/useNotesQuery";
import { useUpdateNoteMutation, useToggleArchiveMutation, useTogglePinMutation } from "@/hooks/useNotesMutations";
import TipTap from "@/components/TipTap";
import AiAuditPanel from "@/components/AiAuditPanel";
import EmptyEditorState from "@/components/EmptyEditorState";
import EditorHeader from "@/components/editor/EditorHeader";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const NoteEditor = () => {
  const { noteId, folderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { mutateAsync: togglePinning } = useTogglePinMutation();
  const { mutateAsync: toggleArchiveMut } = useToggleArchiveMutation();
  const { folders, hasFetched: hasFetchedFolders } = useFolderStore();

  const { data: note, isLoading: isNoteLoading } = useNoteQuery(noteId || "");
  const { mutateAsync: updateNoteAsync } = useUpdateNoteMutation();

  const folder = folders.find((item) => item._id === (note?.folder || folderId));
  const folderLabel = folder?.name ?? (note?.folder ? "Loading folder..." : "All Notes");
  const [draftTitle, setDraftTitle] = useState("");
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 960px)");

  const debouncedUpdate = useMemo(
    () =>
      debounce((id: string, content: string, version: number) => {
        updateNoteAsync({ noteId: id, updates: { content }, version });
      }, 600),
    [updateNoteAsync]
  );

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  useEffect(() => {
    setDraftTitle(note?.title ?? "");
  }, [note?._id, note?.title]);

  const handleContentChange = (html: string) => {
    if (note) {
      debouncedUpdate(note._id, html, note.version);
    }
  };

  const commitTitle = () => {
    if (!note) return;
    if (draftTitle !== note.title) {
      updateNoteAsync({ noteId: note._id, updates: { title: draftTitle }, version: note.version });
    }
  };

  const handleToggleArchive = async (id: string) => {
    if (!note) return;
    const updatedNote = await toggleArchiveMut({ noteId: id, version: note.version });
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

  if (isNoteLoading || (!note && !hasFetchedFolders)) {
    return <div className="flex h-full items-center justify-center text-sm text-[var(--muted-text)]">Loading note...</div>;
  }

  if (!note) {
    return <EmptyEditorState />;
  }

  const editorPane = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.section
        key={note._id}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-w-0 flex-1 flex-col"
      >
        <EditorHeader
          note={note}
          folder={folder}
          folderLabel={folderLabel}
          editor={editorInstance}
          draftTitle={draftTitle}
          onDraftTitleChange={setDraftTitle}
          onCommitTitle={commitTitle}
          onTogglePin={(id) => void togglePinning({ noteId: id, version: note.version })}
          onToggleArchive={handleToggleArchive}
          onAskAi={() => setAiOpen(true)}
        />

        <div className="editor-workspace custom-scrollbar flex-1 overflow-y-auto px-8 pb-8 pt-4 custom-scrollbar">
          <TipTap key={note._id} content={note.content} onChange={handleContentChange} onEditorReady={setEditorInstance} />
        </div>
      </motion.section>
    </AnimatePresence>
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
