import { useMemo, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import debounce from "lodash.debounce";
import type { Editor } from "@tiptap/react";
import { useNoteStore } from "@/store/useNoteStore";
import TipTap from "@/components/TipTap";
import AiAuditPanel from "@/components/AiAuditPanel";
import { getRelativeUpdatedLabel } from "@/utils/getRelativeUpdatedLabel";
import { getContrastTextPalette } from "@/utils/getContrastText";

const NoteEditor = () => {
  const { noteId } = useParams();
  const { notes, updateNote } = useNoteStore();

  const note = notes.find((n) => n?._id === noteId);
  const [draftTitle, setDraftTitle] = useState("");
  const [nowMs, setNowMs] = useState(Date.now());
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);

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
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

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

  if (!note)
    return (
      <div className="flex h-full items-center justify-center text-zinc-400">
        Select a note to start writing
      </div>
    );

  const palette = getContrastTextPalette(note.color || "#1d2436");

  return (
    <div className="relative flex h-full w-full flex-col" style={{ color: palette.text, backgroundColor: note.color }}>
      <div className="relative border-b px-8 pb-3 pt-5" style={{ borderColor: palette.divider }}>
        <div className="mx-auto max-w-3xl">
          <input
            className="w-full bg-transparent text-center text-2xl font-bold tracking-tight outline-none md:text-3xl"
            style={{ color: palette.text, caretColor: "#000000" }}
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
        </div>

        <div className="absolute bottom-2 right-8 text-[10px] font-semibold tracking-[0.08em]" style={{ color: palette.muted }}>
          {getRelativeUpdatedLabel(note.updatedAt, nowMs)}
        </div>
      </div>

      <div
        className="custom-scrollbar flex-1 overflow-y-auto px-8"
        style={{
          background: note.color || "#1d2436",
          color: palette.text,
          ["--editor-text" as string]: palette.text,
          ["--editor-muted" as string]: palette.muted,
          ["--editor-placeholder" as string]: palette.placeholder,
          ["--editor-caret" as string]: "#000000",
        }}
      >
        <TipTap
          key={note._id}
          content={note.content}
          onChange={handleContentChange}
          onEditorReady={setEditorInstance}
        />
      </div>

      <AiAuditPanel noteId={note._id} noteContent={note.content} editor={editorInstance} />
    </div>
  );
};

export default NoteEditor;
