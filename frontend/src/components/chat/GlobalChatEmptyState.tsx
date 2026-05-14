import { useEffect, useRef, useState } from "react";
import { FileImage, Globe, Network, Sparkles } from "lucide-react";

const FEATURE_ITEMS = [
  { icon: Globe, label: "Live web" },
  { icon: FileImage, label: "Images and PDFs" },
  { icon: Network, label: "Diagrams" },
];

const MarqueeRow = ({
  prompts,
  direction = "left",
  onChipClick,
}: {
  prompts: string[];
  direction?: "left" | "right";
  onChipClick: (text: string) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const speed = direction === "left" ? 0.45 : -0.45;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || prompts.length === 0) return;

    let animationId = 0;

    const tick = () => {
      if (!isPaused) {
        container.scrollLeft += speed;
        const halfWidth = container.scrollWidth / 2;

        if (direction === "left" && container.scrollLeft >= halfWidth) {
          container.scrollLeft = 0;
        }

        if (direction === "right" && container.scrollLeft <= 0) {
          container.scrollLeft = halfWidth;
        }
      }

      animationId = requestAnimationFrame(tick);
    };

    if (direction === "right") {
      container.scrollLeft = container.scrollWidth / 2;
    }

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [direction, isPaused, prompts.length, speed]);

  if (prompts.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="gc-marquee-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => window.setTimeout(() => setIsPaused(false), 1600)}
    >
      <div className="gc-marquee-content">
        {[...prompts, ...prompts].map((prompt, index) => (
          <button
            key={`${prompt}-${index}`}
            type="button"
            className="gc-chip"
            onClick={() => onChipClick(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export const GlobalChatEmptyState = ({
  onChipClick,
  prompts,
}: {
  onChipClick: (text: string) => void;
  prompts: { students: string[]; devs: string[] };
}) => {
  const studentPrompts = (prompts.students ?? []).slice(0, 8);
  const devPrompts = (prompts.devs ?? []).slice(0, 8);

  return (
    <div className="gc-empty">
      <div className="gc-empty-orb ai-rail-button ai-rail-button-active" aria-hidden="true">
        <div className="iris-orb iris-orb-lg" />
      </div>

      <div className="gc-empty-copy">
        <h2 className="gc-empty-title">Ask Iris anything</h2>
        <p className="gc-empty-sub">
          Explore ideas, debug code, summarize sources, or turn messy notes into something usable.
        </p>
      </div>

      <div className="gc-feature-strip" aria-label="Iris capabilities">
        {FEATURE_ITEMS.map(({ icon: Icon, label }) => (
          <span key={label} className="gc-feature-pill">
            <Icon size={14} />
            {label}
          </span>
        ))}
      </div>

      <div className="gc-marquee-wrapper">
        <MarqueeRow prompts={studentPrompts} onChipClick={onChipClick} />
        <MarqueeRow prompts={devPrompts} direction="right" onChipClick={onChipClick} />
      </div>

      <div className="gc-empty-footer">
        <Sparkles size={13} />
        <span>Iris keeps the workspace quiet until you ask.</span>
      </div>
    </div>
  );
};
