import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  code: string;
}

const MERMAID_THEME_CONFIG = {
  startOnLoad: false,
  theme: "dark" as const,
};

mermaid.initialize(MERMAID_THEME_CONFIG);

const sanitizeMermaidCode = (rawCode: string) => {
  let cleaned = rawCode
    .replace(/```[a-z]*\n?/gi, "")
    .replace(/```/g, "")
    .trim()
    .replace(/\|>\s*/g, "| ");

  // Models sometimes emit flowchart edge labels as -->|Label|> B.
  // Mermaid expects -->|Label| B, so strip the extra chevron.
  cleaned = cleaned.replace(/\|([^|\n]+)\|>/g, "|$1| ");

  // Edge labels sometimes contain square-bracket tokens like [IRIS_VIZ],
  // which Mermaid can confuse with node syntax inside |label| edges.
  cleaned = cleaned.replace(/\|([^|\n]+)\|/g, (_match, label: string) => {
    const normalizedLabel = label
      .replace(/\[([^[\]\n]+)\]/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
    return `|${normalizedLabel}|`;
  });

  // Flowchart labels with parentheses inside square brackets can trip Mermaid.
  // Convert A[Client (Browser)] into A["Client (Browser)"].
  cleaned = cleaned.replace(
    /\b([A-Za-z0-9_]+)\[([^\]\n]*[()]+[^\]\n]*)\]/g,
    (_match, nodeId: string, label: string) => {
      const normalizedLabel = label.replace(/"/g, "&quot;").trim();
      return `${nodeId}["${normalizedLabel}"]`;
    }
  );

  // Mermaid sequenceDiagram notes support one or two participants, not more.
  cleaned = cleaned.replace(
    /^(\s*Note\s+over\s+)([^:]+)(\s*:.*)$/gim,
    (_match, prefix: string, actors: string, suffix: string) => {
      const parts = actors
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

      if (parts.length <= 2) return `${prefix}${actors}${suffix}`;
      return `${prefix}${parts[0]},${parts[parts.length - 1]}${suffix}`;
    }
  );

  return cleaned;
};

const makeSvgResponsive = (svg: string) => {
  const widthMatch = svg.match(/\bwidth="([^"]+)"/i);
  const heightMatch = svg.match(/\bheight="([^"]+)"/i);
  const viewBoxMatch = svg.match(/\bviewBox="([^"]+)"/i);

  let responsiveSvg = svg
    .replace(/\bwidth="[^"]*"/i, 'width="100%"')
    .replace(/\bheight="[^"]*"/i, 'height="100%"');

  if (!viewBoxMatch && widthMatch && heightMatch) {
    const rawWidth = Number.parseFloat(widthMatch[1]);
    const rawHeight = Number.parseFloat(heightMatch[1]);

    if (Number.isFinite(rawWidth) && Number.isFinite(rawHeight)) {
      responsiveSvg = responsiveSvg.replace(
        /<svg\b/i,
        `<svg viewBox="0 0 ${rawWidth} ${rawHeight}" preserveAspectRatio="xMidYMin meet"`
      );
    }
  } else if (viewBoxMatch && !/preserveAspectRatio=/i.test(responsiveSvg)) {
    responsiveSvg = responsiveSvg.replace(
      /<svg\b/i,
      '<svg preserveAspectRatio="xMidYMin meet"'
    );
  }

  if (!/style="/i.test(responsiveSvg)) {
    responsiveSvg = responsiveSvg.replace(
      /<svg\b/i,
      '<svg style="width:100%;height:auto;display:block;"'
    );
  } else {
    responsiveSvg = responsiveSvg.replace(
      /style="([^"]*)"/i,
      (_match, styles: string) =>
        `style="${styles};width:100%;height:auto;display:block;"`
    );
  }

  return responsiveSvg;
};

const MermaidDiagram = ({ code }: MermaidDiagramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderIdRef = useRef(0);
  const diagramIdRef = useRef(`mermaid-${crypto.randomUUID()}`);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) {
      setError(true);
      setLoading(false);
      return;
    }

    renderIdRef.current += 1;
    const currentRenderId = renderIdRef.current;

    const renderDiagram = async () => {
      setLoading(true);
      setError(false);

      try {
        if (!containerRef.current) return;

        const cleanCode = sanitizeMermaidCode(code);

        await mermaid.parse(cleanCode);

        const { svg } = await mermaid.render(diagramIdRef.current, cleanCode);
        const responsiveSvg = makeSvgResponsive(svg);

        if (renderIdRef.current !== currentRenderId) return;
        if (!containerRef.current) return;

        containerRef.current.innerHTML = responsiveSvg;
        setLoading(false);
      } catch {
        if (renderIdRef.current !== currentRenderId) return;
        setError(true);
        setLoading(false);
      }
    };

    renderDiagram();
  }, [code]);

  if (error) {
    return (
      <div className="iris-viz-error">
        Failed to render diagram.
        <pre className="text-xs opacity-60">{code}</pre>
      </div>
    );
  }

  return (
    <div className="iris-mermaid-wrap">
      {loading && <div>Rendering diagram...</div>}
      <div
        ref={containerRef}
        className="iris-mermaid"
        style={{ display: loading ? "none" : "block" }}
      />
    </div>
  );
};

export default MermaidDiagram;
