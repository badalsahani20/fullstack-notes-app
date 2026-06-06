import { useEffect } from "react";
import { X, Settings } from "lucide-react";
import { useEditorUIStore } from "@/store/useEditorUIStore";
import { ShortcutsTab } from "@/components/settings/ShortcutsTab";
import { useSettingsUIStore } from "@/store/useSettingsStore";

/**
 * Quick-access shortcuts overlay triggered by Ctrl/⌘ + /
 * The full reference lives in Settings → Shortcuts.
 */
export const KeyboardShortcutsModal = () => {
  const { shortcutsOpen, setShortcutsOpen } = useEditorUIStore();
  const { openSettings } = useSettingsUIStore();

  useEffect(() => {
    if (!shortcutsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShortcutsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcutsOpen, setShortcutsOpen]);

  if (!shortcutsOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={() => setShortcutsOpen(false)}
    >
      <div
        style={{
          background: "#0f0f11",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "1rem",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          width: "100%",
          maxWidth: "780px",
          maxHeight: "82vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.25rem 0.75rem",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#f4f4f5" }}>
            Keyboard Shortcuts
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => { setShortcutsOpen(false); openSettings?.(); }}
              title="Open in Settings"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.75rem",
                color: "#6366f1",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "0.35rem 0.6rem",
                borderRadius: "0.4rem",
              }}
            >
              <Settings size={13} />
              Open in Settings
            </button>
            <button
              onClick={() => setShortcutsOpen(false)}
              title="Close"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: "0.4rem",
                background: "transparent",
                border: "none",
                color: "#71717a",
                cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content — reuse ShortcutsTab */}
        <div style={{ overflowY: "auto", padding: "1.25rem", flex: 1, minHeight: 0 }}>
          <ShortcutsTab />
        </div>
      </div>
    </div>
  );
};
