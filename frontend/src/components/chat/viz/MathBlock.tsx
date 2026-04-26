import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathBlockProps {
  formula: string;
  inline?: boolean;
}

const MathBlock = ({ formula, inline = false }: MathBlockProps) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode: !inline,
        throwOnError: false,
        strict: "warn",
        output: "html",
      });
    } catch {
      return null;
    }
  }, [formula, inline]);

  if (!html) {
    return (
      <div className="iris-viz-error">
        ⚠️ Math formula could not be rendered.
      </div>
    );
  }

  return (
    <div
      className="iris-math"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MathBlock;