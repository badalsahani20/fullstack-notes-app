import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AI_PANEL_GUIDE_KEY = "ai-panel-guide-seen";

/**
 * One-time "how to use AI" welcome dialog.
 * Reads a localStorage flag on mount — if the user has never seen it,
 * it auto-opens. When they close it, the flag is written so it never
 * appears again.
 */
const AiGuideDialog = () => {
  const [open, setOpen] = useState(false);

  // On mount: check if this user has already seen the guide
  useEffect(() => {
    const alreadySeen = window.localStorage.getItem(AI_PANEL_GUIDE_KEY);
    if (!alreadySeen) {
      setOpen(true);
    }
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    // When closing (nextOpen = false), mark it as seen so it never shows again
    if (!nextOpen) {
      window.localStorage.setItem(AI_PANEL_GUIDE_KEY, "true");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="desktop-dialog max-w-sm border-zinc-800 bg-zinc-950 text-zinc-100">
        <DialogHeader>
          <DialogTitle>How to use AI Assistant</DialogTitle>
        </DialogHeader>
        <div className="assistant-guide-list">
          <p>Ask a question to chat about the current note.</p>
          <p>Select text first if you want help with a specific section.</p>
          <p>Use the quick actions for fast rewrite, summary, or improvement passes.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AiGuideDialog;
