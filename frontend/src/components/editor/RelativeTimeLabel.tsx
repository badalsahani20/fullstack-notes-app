import { useEffect, useState } from "react";
import { getRelativeUpdatedLabel } from "@/utils/getRelativeUpdatedLabel";

type RelativeTimeLabelProps = {
  /** The ISO timestamp string of when the note was last updated */
  updatedAt: string;
};

/**
 * Displays a relative time string (e.g. "Updated 2 mins ago").
 * 
 * Extracted into its own component so its internal 1-second interval timer
 * only re-renders this tiny text node, instead of re-rendering the entire 
 * TipTap editor and parent tree.
 */
const RelativeTimeLabel = ({ updatedAt }: RelativeTimeLabelProps) => {
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    // Tick every 1 second to update the relative time string
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return <span>{getRelativeUpdatedLabel(updatedAt, nowMs)}</span>;
};

export default RelativeTimeLabel;
