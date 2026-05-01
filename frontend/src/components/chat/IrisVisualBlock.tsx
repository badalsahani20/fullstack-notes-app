import { useState, lazy, Suspense } from "react";
import { Expand, Loader2 } from "lucide-react";
import type { IrisSegment } from "@/store/useGlobalChatStore";

const MermaidDiagram = lazy(() => import("./viz/MermaidDiagram"));
const ChartBlock = lazy(() => import("./viz/ChartBlock"));
const MathBlock = lazy(() => import("./viz/MathBlock"));

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type VizSegment = Extract<IrisSegment, { kind: "viz" }>;

interface IrisVisualBlockProps {
  visualization: VizSegment;
}

const IrisVisualBlock = ({ visualization: v }: IrisVisualBlockProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderViz = (expanded = false) => {
    switch (v.type) {
      case "mermaid":
        return <MermaidDiagram code={v.data} />;
      case "chart":
        return <ChartBlock data={v.data} expanded={expanded} />;
      case "math":
        return <MathBlock formula={v.data} />;
      default:
        return (
          <div className="iris-viz-error">
            ⚠️ Unsupported visualization type: {v.type}
          </div>
        );
    }
  };

  return (
    <>
    <div className="iris-viz-block">
      {v.title && <p className="iris-viz-title">{v.title}</p>}
      <button
        type="button"
        className="iris-viz-surface"
        onClick={() => setIsExpanded(true)}
        aria-label={v.title ? `Expand ${v.title}` : "Expand diagram"}
      >
        <span className="iris-viz-expand" aria-hidden="true">
          <Expand size={16} />
        </span>
        <Suspense fallback={
          <div className="flex h-32 items-center justify-center rounded-xl bg-white/[0.03] animate-pulse">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-500/50" />
          </div>
        }>
          {renderViz(false)}
        </Suspense>
      </button>
      <div className="iris-viz-footer">
        <button 
          className="iris-viz-btn"
          onClick={() => setIsExpanded(true)}
        >
          <Expand size={12} />
          <span>View Full Diagram</span>
        </button>
      </div>
    </div>
    <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
      <DialogContent
        className="iris-viz-modal"
        showCloseButton={true}
        aria-describedby={undefined}
      >
        <DialogTitle className="iris-viz-modal-title">
          {v.title || "Expanded diagram"}
        </DialogTitle>
        <div className="iris-viz-modal-body">
          <Suspense fallback={
             <div className="flex h-64 items-center justify-center">
               <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
             </div>
          }>
            {renderViz(true)}
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default IrisVisualBlock;
