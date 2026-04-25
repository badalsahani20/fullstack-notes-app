import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// ─── Marquee Component (Interactive)
const MarqueeRow = ({ prompts, direction = "left", onChipClick }: { prompts: string[], direction?: "left" | "right", onChipClick: (s: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const speed = direction === "left" ? 0.6 : -0.6; // pixels per frame

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationId: number;

    const scroll = () => {
      if (!isInteracting && container) {
        container.scrollLeft += speed;

        // Infinite loop logic
        const halfWidth = container.scrollWidth / 2;
        if (direction === "left") {
          if (container.scrollLeft >= halfWidth) container.scrollLeft = 0;
        } else {
          if (container.scrollLeft <= 0) container.scrollLeft = halfWidth;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isInteracting, speed, direction]);

  return (
    <div 
      ref={containerRef}
      className="gc-marquee-container interactive-marquee"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onTouchStart={() => setIsInteracting(true)}
      onTouchEnd={() => {
        // Resume after a short delay for better feel
        setTimeout(() => setIsInteracting(false), 2000);
      }}
    >
      <div className="gc-marquee-content">
        {[...prompts, ...prompts].map((s, i) => (
          <button key={`${s}-${i}`} className="gc-chip" onClick={() => onChipClick(s)}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

export const GlobalChatEmptyState = ({ onChipClick, prompts }: { onChipClick: (text: string) => void, prompts: { students: string[], devs: string[] } }) => (
  <div className="gc-empty">
    <div className="gc-empty-orb ai-rail-button ai-rail-button-active !w-20 !h-20 !rounded-3xl mx-auto cursor-default font-medium">
      <div className="iris-orb iris-orb-lg" />
    </div>
    <h2 className="gc-empty-title">Ask Iris anything</h2>
    <p className="gc-empty-sub">
      Your AI learning companion. Ask questions, explore ideas, or dig into any topic — no note needed.
    </p>

    <div className="gc-marquee-wrapper">
      <MarqueeRow prompts={prompts.students} onChipClick={onChipClick} />
      <MarqueeRow prompts={prompts.devs} direction="right" onChipClick={onChipClick} />
    </div>
  </div>
);
