import { useSettingsStore } from "@/store/useSettingsStore";
import type { EditorFontFamily, EditorFontSize, LineSpacing } from "@/store/useSettingsStore";
import { SectionLabel, ToggleRow, OptionChip } from "./SettingsShared";

export const EditorTab = () => {
  const {
    editorFont, setEditorFont,
    editorFontSize, setEditorFontSize,
    spellCheck, setSpellCheck,
    showWordCount, setShowWordCount,
    autoSaveIndicator, setAutoSaveIndicator,
    focusModeDefault, setFocusModeDefault,
    lineSpacing, setLineSpacing,
  } = useSettingsStore();

  const fonts: { value: EditorFontFamily; label: string }[] = [
    { value: "Inter", label: "Inter" },
    { value: "Georgia", label: "Georgia" },
    { value: "Lora", label: "Lora" },
    { value: "JetBrains Mono", label: "Mono" },
    { value: "system-ui", label: "System" },
  ];

  const sizes: { value: EditorFontSize; label: string }[] = [
    { value: "sm", label: "Small" },
    { value: "md", label: "Medium" },
    { value: "lg", label: "Large" },
    { value: "xl", label: "X-Large" },
  ];

  return (
    <div>
      <SectionLabel>Font Family</SectionLabel>
      <div className="flex gap-2 flex-wrap">
        {fonts.map(({ value, label }) => (
          <OptionChip
            key={value}
            label={label}
            value={value}
            current={editorFont}
            onSelect={setEditorFont}
          />
        ))}
      </div>

      <SectionLabel>Font Size</SectionLabel>
      <div className="flex gap-2 flex-wrap">
        {sizes.map(({ value, label }) => (
          <OptionChip
            key={value}
            label={label}
            value={value}
            current={editorFontSize}
            onSelect={setEditorFontSize}
          />
        ))}
      </div>

      <SectionLabel>Line Spacing</SectionLabel>
      <div className="flex gap-2 flex-wrap">
        {(
          [
            { value: "normal", label: "Normal" },
            { value: "relaxed", label: "Relaxed" },
          ] as { value: LineSpacing; label: string }[]
        ).map(({ value, label }) => (
          <OptionChip
            key={value}
            label={label}
            value={value}
            current={lineSpacing}
            onSelect={setLineSpacing}
          />
        ))}
      </div>

      <SectionLabel>Behavior</SectionLabel>
      <div className="rounded-xl border border-white/8 bg-white/4 overflow-hidden px-4">
        <ToggleRow
          label="Spell Check"
          description="Highlight spelling errors as you type"
          value={spellCheck}
          onChange={setSpellCheck}
        />
        <ToggleRow
          label="Show Word Count"
          description="Display word and character count in the editor"
          value={showWordCount}
          onChange={setShowWordCount}
        />
        <ToggleRow
          label="Auto-save Indicator"
          description="Show a subtle saved indicator when changes sync"
          value={autoSaveIndicator}
          onChange={setAutoSaveIndicator}
        />
        <ToggleRow
          label="Default Focus Mode"
          description="Open notes in distraction-free focus mode by default"
          value={focusModeDefault}
          onChange={setFocusModeDefault}
        />
      </div>
    </div>
  );
};
