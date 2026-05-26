import { Suspense, useCallback, useEffect, useMemo, useState, useRef, lazy } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import debounce from "lodash.debounce";
import type { Editor } from "@tiptap/react";
import { Wand2, Loader2 } from "lucide-react";
import { useFolderStore } from "@/store/useFolderStore";
import { useNoteQuery } from "@/hooks/useNotesQuery";
import { usePanelStore } from "@/store/usePanelStore";
import { useUpdateNoteMutation, useToggleArchiveMutation, useTogglePinMutation, useCreateNoteMutation } from "@/hooks/useNotesMutations";
import TipTap from "@/components/editor/TipTap";
import { useSettingsStore } from "@/store/useSettingsStore";
const ContextualAiPanel = lazy(() => import("@/components/chat/ContextualAiPanel"));
const StudyPanel = lazy(() => import("@/components/study/StudyPanel"));

import EmptyEditorState from "@/components/editor/EmptyEditorState";
import EditorHeader from "@/components/editor/EditorHeader";
import { GenerateNotesDialog } from "@/components/editor/GenerateNotesDialog";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAiChat } from "@/hooks/useAiChat";
import EditorToolbar from "@/tools/EditorToolbar";
import AiResultDialog from "@/components/ai/AiResultDialog";
import { NoteEditorSkeleton } from "@/components/ui/noteEditorSkeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { actionMeta } from "@/components/ai/types";

const preloadAiPanel = () => import("@/components/chat/ContextualAiPanel");

const AiPanelSkeleton = ({ mobileMode = false }: { mobileMode?: boolean }) => (
  <aside className={`assistant-rail ${mobileMode ? "assistant-rail-mobile" : "flex"}`}>
    <div className="assistant-rail-header assistant-rail-header-row">
      <div className="assistant-panel-heading">
        <h3 className="assistant-panel-title">AI Assistant</h3>
      </div>
    </div>

    <div className="flex-1 space-y-4 p-4">
      <div className="h-16 rounded-2xl bg-white/[0.04] animate-pulse" />
      <div className="h-24 rounded-2xl bg-white/[0.04] animate-pulse" />
      <div className="h-24 rounded-2xl bg-white/[0.04] animate-pulse" />
    </div>

    <div className="p-4">
      <div className="h-28 rounded-2xl bg-white/[0.04] animate-pulse" />
    </div>
  </aside>
);

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
  const { mutateAsync: updateNoteAsync, isPending: isSavingNote } = useUpdateNoteMutation();

  const [isCreating, setIsCreating] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const createdNoteIdRef = useRef<string | null>(null);
  const [isGenerateNotesOpen, setIsGenerateNotesOpen] = useState(false);

  const note = isNew
    ? { _id: "new", title: draftTitle, content: "", folder: folderId, pinned: false, isArchived: false, version: 1, updatedAt: new Date().toISOString() } as any
    : fetchedNote;

  const folder = folders.find((item) => item._id === (note?.folder || folderId));
  const folderLabel = folder?.name ?? (note?.folder && note?._id !== "new" ? "Loading folder..." : "All Notes");
  const { isAiPanelOpen, setAiPanelOpen } = usePanelStore();
  const [isStudyPanelOpen, setStudyPanelOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 960px)");

  const { focusModeDefault } = useSettingsStore();

  const lastInitializedNoteIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!noteId || isNew) return;

    if (noteId !== lastInitializedNoteIdRef.current) {
      lastInitializedNoteIdRef.current = noteId;

      if (focusModeDefault) {
        const searchParams = new URLSearchParams(location.search);
        if (!searchParams.has("focus")) {
          searchParams.set("focus", "2");
          navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
        }
      }
    }
  }, [focusModeDefault, noteId, isNew, location.search, location.pathname, navigate]);

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

  useEffect(() => {
    if (isAiPanelOpen) {
      void preloadAiPanel();
    }
  }, [isAiPanelOpen]);

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
          }).catch(() => { }); // Conflict handled in mutation hook
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

  const handleCreateOnEdit = useCallback(async (initialTitle: string, initialContent: string) => {
    if (isCreating) return null;
    setIsCreating(true);
    try {
      const newNote = await createNoteAsync({
        title: initialTitle || "Untitled Note",
        content: initialContent,
        folderId: folderId
      });
      if (newNote?._id) {
        createdNoteIdRef.current = newNote._id;
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
  }, [createNoteAsync, folderId, isCreating, location.search, navigate]);

  const handleContentChange = useCallback((html: string) => {
    if (isNew) {
      handleCreateOnEdit(draftTitle, html);
    } else if (note) {
      debouncedUpdate(note._id, html);
    }
  }, [isNew, note, draftTitle, handleCreateOnEdit, debouncedUpdate]);

  const commitTitle = useCallback(() => {
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
      }).catch(() => { });
    }
  }, [note, isNew, draftTitle, editorInstance, handleCreateOnEdit, updateNoteAsync]);

  const handleToggleArchive = useCallback(async (id: string) => {
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
  }, [note, isNew, toggleArchiveMut, navigate, location.search]);

  const handleTogglePin = useCallback((id: string) => {
    if (isNew || !note) return;
    void togglePinning({ noteId: id, version: note.version });
  }, [isNew, note, togglePinning]);

  if (isNoteLoading || (!note && !hasFetchedFolders && !isNew)) {
    return <NoteEditorSkeleton />;
  }

  if (!note && !isNew) {
    return <EmptyEditorState />;
  }

  const editorKey = (isNew || (note?._id && note._id === createdNoteIdRef.current)) 
    ? "stable-new-note-editor" 
    : note?._id;

  const editorPane = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.section
        key={editorKey}
        initial={isNew ? {} : { opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex min-w-0 flex-1 flex-col h-full min-h-0"
      >
        <EditorHeader
          note={note}
          folder={folder}
          folderLabel={folderLabel}
          editor={editorInstance}
          draftTitle={draftTitle}
          onDraftTitleChange={setDraftTitle}
          onCommitTitle={commitTitle}
          onTogglePin={handleTogglePin}
          onToggleArchive={handleToggleArchive}
          onAskAi={() => setAiPanelOpen(!isAiPanelOpen)}
          onAskAiHover={() => void preloadAiPanel()}
          isAiOpen={isAiPanelOpen}
          onStudy={() => {
            const nextOpen = !isStudyPanelOpen;
            setStudyPanelOpen(nextOpen);
            
            const params = new URLSearchParams(location.search);
            if (nextOpen) {
              params.set("focus", "2");
            } else {
              params.delete("focus");
            }
            navigate(`${location.pathname}?${params.toString()}`, { replace: true });
          }}
          isStudyOpen={isStudyPanelOpen}
          isMobile={isMobile}

          isSaving={isSavingNote}
          loadingAction={aiChat.loadingAction}
          onRunAction={aiChat.runAction}
          onOpenGenerateNotes={() => setIsGenerateNotesOpen(true)}
        />

        <div className="editor-workspace custom-scrollbar flex-1 overflow-y-auto px-8 pb-8 pt-4">
          <TipTap
            noteId={note?._id}
            content={isNew ? "" : note.content}
            onChange={handleContentChange}
            onEditorReady={setEditorInstance}
            aiChat={aiChat}
          />
        </div>

        {editorInstance && (!isMobile || !isAiPanelOpen) && (
          <EditorToolbar
            editor={editorInstance}
            isMobile={isMobile}
            yOffset={isMobile ? keyboardOffset : 0}
            aiChat={aiChat}
          />
        )}
      </motion.section>
    </AnimatePresence>
  );

  return (
    <div className="flex h-full min-h-0 w-full relative">
      {isMobile ? (
        <>
          {editorPane}
          {isAiPanelOpen && (
            <div className="assistant-mobile-overlay">
              <Suspense fallback={<AiPanelSkeleton mobileMode />}>
                <ContextualAiPanel
                  aiChat={aiChat}
                  noteTitle={draftTitle || note?.title}
                  isNewNote={isNew}
                  onClose={() => setAiPanelOpen(false)}
                  mobileMode
                />
              </Suspense>
            </div>
          )}
        </>
      ) : (
        <ResizablePanelGroup orientation="horizontal" className="h-full min-h-0">
          {/* Study panel — left side */}
          {isStudyPanelOpen && (
            <>
              <ResizablePanel
                defaultSize="25%"
                minSize="20%"
                maxSize="40%"
                className="h-full"
              >
                <Suspense fallback={<div className="study-skeleton h-full" />}>
                  <StudyPanel
                    noteId={noteId || ""}
                    chatHistory={aiChat.chatHistory ?? []}
                    onClose={() => setStudyPanelOpen(false)}
                  />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle className="assistant-resize-handle" />
            </>
          )}

          {/* Stable Central Editor */}
          <ResizablePanel minSize="0" className="min-w-0 h-full">
            {editorPane}
          </ResizablePanel>

          {/* AI Assistant panel — right side */}
          {isAiPanelOpen && (
            <>
              <ResizableHandle className="assistant-resize-handle" />
              <ResizablePanel
                defaultSize="35%"
                minSize="25%"
                maxSize="55%"
                className="assistant-panel-shell h-full"
              >
                <Suspense fallback={<AiPanelSkeleton />}>
                  <ContextualAiPanel
                    aiChat={aiChat}
                    noteTitle={draftTitle || note?.title}
                    isNewNote={isNew}
                    onClose={() => setAiPanelOpen(false)}
                  />
                </Suspense>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      )}

      {isMobile && !isAiPanelOpen ? (
        <div className="mobile-ai-fab-stack">
          {/* Actions dropdown — replaces single Summarize button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="mobile-ai-fab mobile-ai-fab-sm mobile-ai-fab-secondary disabled:opacity-80 disabled:cursor-not-allowed"
                aria-label="AI Actions"
                disabled={aiChat.loadingAction !== null}
              >
                {aiChat.loadingAction ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Wand2 size={14} />
                )}
                <span>{aiChat.loadingAction ? "Thinking..." : "Actions"}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="assistant-actions-menu w-44 shadow-md z-[99999]"
            >
              {(Object.keys(actionMeta) as (keyof typeof actionMeta)[]).map((action) => (
                <DropdownMenuItem
                  key={action}
                  onClick={() => void aiChat.runAction(action)}
                  className="assistant-actions-menu-item cursor-pointer text-sm py-1.5 transition-colors"
                >
                  {actionMeta[action].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}

      <AiResultDialog
        result={aiChat.result}
        onApply={aiChat.applySuggestionToSelection}
        onClose={() => aiChat.setResult(null)}
      />

      <GenerateNotesDialog
        isOpen={isGenerateNotesOpen}
        onClose={() => setIsGenerateNotesOpen(false)}
        onGenerate={(promptContext) => void aiChat.runAction("noteCreation", promptContext)}
      />
    </div>
  );
};

export default NoteEditor;
