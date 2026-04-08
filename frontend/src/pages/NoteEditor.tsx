import { useEffect, useMemo, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import debounce from "lodash.debounce";
import type { Editor } from "@tiptap/react";
import { useFolderStore } from "@/store/useFolderStore";
import { useNoteQuery } from "@/hooks/useNotesQuery";
import { useUpdateNoteMutation, useToggleArchiveMutation, useTogglePinMutation, useCreateNoteMutation } from "@/hooks/useNotesMutations";
import TipTap from "@/components/TipTap";
import AiAuditPanel from "@/components/AiAuditPanel";
import EmptyEditorState from "@/components/EmptyEditorState";
import EditorHeader from "@/components/editor/EditorHeader";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAiChat } from "@/hooks/useAiChat";
import EditorToolbar from "@/tools/EditorToolbar";
import AiResultDialog from "@/components/ai/AiResultDialog";

const NoteEditor = () => {
  const { noteId, folderId } = useParams();
  const isNew = noteId === "new";
  const location = useLocation();
  const navigate = useNavigate();
  const { mutateAsync: togglePinning } = useTogglePinMutation();
  const { mutateAsync: toggleArchiveMut } = useToggleArchiveMutation();
  const { mutateAsync: createNoteAsync } = useCreateNoteMutation();
  const { folders, hasFetched: hasFetchedFolders } = useFolderStore();

  const { data: fetchedNote, isLoading: isNoteLoading } = useNoteQuery(isNew ? "" : (noteId || ""));
  const { mutateAsync: updateNoteAsync } = useUpdateNoteMutation();

  const [isCreating, setIsCreating] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);

  const note = isNew 
    ? { _id: "new", title: draftTitle, content: "", folder: folderId, pinned: false, isArchived: false, version: 1, updatedAt: new Date().toISOString() } as any
    : fetchedNote;

  const folder = folders.find((item) => item._id === (note?.folder || folderId));
  const folderLabel = folder?.name ?? (note?.folder && note?._id !== "new" ? "Loading folder..." : "All Notes");
  const [aiOpen, setAiOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 960px)");
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (!isMobile || !window.visualViewport) return;
    
    const handler = () => {
      if (!window.visualViewport) return;
      const viewport = window.visualViewport;
      // Calculate how much the bottom is obscured by the keyboard
      const offset = window.innerHeight - viewport.height - viewport.offsetTop;
      setKeyboardOffset(Math.max(0, offset));
    };

    window.visualViewport.addEventListener("resize", handler);
    window.visualViewport.addEventListener("scroll", handler);
    return () => {
      window.visualViewport?.removeEventListener("resize", handler);
      window.visualViewport?.removeEventListener("scroll", handler);
    };
  }, [isMobile]);

  const aiChat = useAiChat(noteId || "", note?.content || "", editorInstance);

  const noteRef = useRef(note);
  useEffect(() => {
    noteRef.current = note;
  }, [note]);

  const debouncedUpdate = useMemo(
    () =>
      debounce((id: string, content: string) => {
        const latestNote = noteRef.current;
        if (latestNote && latestNote._id === id && id !== "new") {
          updateNoteAsync({ 
            noteId: id, 
            updates: { content }, 
            version: latestNote.version 
          }).catch(() => {}); // Conflict handled in mutation hook
        }
      }, 1000),
    [updateNoteAsync]
  );

  useEffect(() => {
    return () => {
      debouncedUpdate.flush();
    };
  }, [debouncedUpdate]);

  useEffect(() => {
    if (!isNew) {
      setDraftTitle(note?.title ?? "");
    }
  }, [isNew, note?._id, note?.title]);

  const handleCreateOnEdit = async (initialTitle: string, initialContent: string) => {
    if (isCreating) return null;
    setIsCreating(true);
    try {
      const newNote = await createNoteAsync({
        title: initialTitle || "Untitled Note",
        content: initialContent,
        folderId: folderId
      });
      if (newNote?._id) {
        const path = folderId ? `/folders/${folderId}/note/${newNote._id}` : `/note/${newNote._id}`;
        navigate(`${path}${location.search}`, { replace: true });
        return newNote;
      }
    } catch (err) {
      console.error("Lazy creation failed:", err);
    } finally {
      setIsCreating(false);
    }
    return null;
  };

  const handleContentChange = (html: string) => {
    if (isNew) {
      handleCreateOnEdit(draftTitle, html);
    } else if (note) {
      debouncedUpdate(note._id, html);
    }
  };

  const commitTitle = () => {
    if (!note) return;
    if (isNew) {
      if (draftTitle.trim()) {
        const content = editorInstance?.getHTML() || "";
        handleCreateOnEdit(draftTitle, content);
      }
      return;
    }
    const currentNote = noteRef.current || note;
    if (draftTitle !== currentNote.title) {
      updateNoteAsync({ 
        noteId: currentNote._id, 
        updates: { title: draftTitle }, 
        version: currentNote.version 
      }).catch(() => {});
    }
  };

  const handleToggleArchive = async (id: string) => {
    if (!note || isNew) return;
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

  if (isNoteLoading || (!note && !hasFetchedFolders && !isNew)) {
    return <div className="flex h-full items-center justify-center text-sm text-[var(--muted-text)]">Loading note...</div>;
  }

  if (!note && !isNew) {
    return <EmptyEditorState />;
  }

  const editorPane = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.section
        key={note._id}
        initial={isNew ? {} : { opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-w-0 flex-1 flex-col h-full min-h-0"
      >
        <EditorHeader
          note={note}
          folder={folder}
          folderLabel={folderLabel}
          editor={editorInstance}
          draftTitle={draftTitle}
          onDraftTitleChange={setDraftTitle}
          onCommitTitle={commitTitle}
          onTogglePin={(id) => {
            if (isNew) return;
            void togglePinning({ noteId: id, version: note.version })
          }}
          onToggleArchive={handleToggleArchive}
          onAskAi={() => setAiOpen(true)}
          isAiOpen={aiOpen}
          isMobile={isMobile}
        />

        <div className="editor-workspace custom-scrollbar flex-1 overflow-y-auto px-8 pb-8 pt-4">
          <TipTap 
            key={note._id} 
            content={isNew ? "" : note.content} 
            onChange={handleContentChange} 
            onEditorReady={setEditorInstance} 
            aiChat={aiChat} 
          />
        </div>

        {isMobile && editorInstance && !aiOpen && (
          <EditorToolbar 
            editor={editorInstance} 
            onAskAi={() => setAiOpen(true)} 
            isMobile={true} 
            yOffset={keyboardOffset}
          />
        )}
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
              aiChat={aiChat}
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
            <AiAuditPanel aiChat={aiChat} onClose={() => setAiOpen(false)} />
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        editorPane
      )}
      
      <AiResultDialog 
        result={aiChat.result} 
        onApply={aiChat.applySuggestionToSelection} 
        onClose={() => aiChat.setResult(null)} 
      />
    </div>
  );
};



export default NoteEditor;
