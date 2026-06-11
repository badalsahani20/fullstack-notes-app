import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface ChatModeSelectorProps {
  chatMode: "study" | "casual";
  setChatMode: (mode: "study" | "casual") => void;
}

export const ChatModeSelector = ({ chatMode, setChatMode }: ChatModeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const modes = [
    { id: "study", label: "Study", icon: "📚", desc: "Structured teaching & formatting" },
    { id: "casual", label: "Chat", icon: "💬", desc: "Natural, concise conversation" },
  ];

  const activeMode = modes.find(m => m.id === chatMode) || modes[0];

  return (
    <div className="relative flex items-center" ref={menuRef} style={{ marginLeft: "0.5rem" }}>
      <button
        type="button"
        className="gc-mode-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Change AI Mode"
      >
        <span>{activeMode.icon}</span>
        <span style={{ fontWeight: 600 }}>{activeMode.label}</span>
        <ChevronDown size={14} className="opacity-70" />
      </button>

      {isOpen && (
        <div className="gc-mode-dropdown">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`gc-mode-dropdown-item ${chatMode === m.id ? "active" : ""}`}
              onClick={() => {
                setChatMode(m.id as "study" | "casual");
                setIsOpen(false);
              }}
            >
              <span style={{ fontSize: "1rem" }}>{m.icon}</span>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "var(--text-strong)" }}>{m.label}</div>
                <div style={{ fontSize: "0.65rem", color: "var(--muted-text)", lineHeight: 1.2, marginTop: "2px" }}>{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
