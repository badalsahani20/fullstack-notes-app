import React, { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import { Cloud, CloudFog, CloudUpload } from "lucide-react";

type EditorStatsProps = {
  editor: Editor | null;
  /** Pass down an isSaving prop from the mutation if available */
  isSaving?: boolean;
};

export const EditorStats = ({ editor, isSaving = false }: EditorStatsProps) => {
  const [words, setWords] = useState(0);
  const [syncState, setSyncState] = useState<"synced" | "typing" | "saving">("synced");
  const typingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!editor) return;

    const updateStats = () => {
      const text = editor.getText().trim();
      setWords(text ? text.split(/\s+/).length : 0);
      
      // Update sync state
      setSyncState("typing");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        setSyncState("synced");
      }, 1500); // 1.5s after last keystroke, assume idle or saved
    };

    updateStats(); // Initial

    editor.on("update", updateStats);
    return () => {
      editor.off("update", updateStats);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [editor]);

  useEffect(() => {
    if (isSaving) {
      setSyncState("saving");
    } else if (syncState === "saving") {
      setSyncState("synced");
    }
  }, [isSaving]);

  if (!editor) return null;

  return (
    <div className="flex items-center gap-3 text-[11.5px] font-medium text-[var(--text-muted)] tracking-wide select-none">
      <span className="tabular-nums">{words} {words === 1 ? 'word' : 'words'}</span>
      <span className="opacity-30 font-normal">—</span>
      <span className="tabular-nums">{Math.max(1, Math.ceil(words / 200))} min read</span>
      
      <span className="opacity-30 font-normal">—</span>

      <div className="flex items-center gap-1.5 transition-colors duration-300">
        {syncState === "typing" && (
          <>
            <CloudFog size={13} className="opacity-60" />
            <span className="opacity-70">Editing...</span>
          </>
        )}
        {syncState === "saving" && (
          <>
            <CloudUpload size={13} className="opacity-80 animate-pulse text-[var(--accent-strong)]" />
            <span className="text-[var(--accent-strong)]">Saving...</span>
          </>
        )}
        {syncState === "synced" && (
          <>
            <Cloud size={13} className="opacity-40" />
            <span className="opacity-50">Saved to cloud</span>
          </>
        )}
      </div>
    </div>
  );
};
