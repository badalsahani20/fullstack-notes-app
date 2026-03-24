import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import GlobalSearch from "../search/GlobalSearch";

/**
 * Global search bar in the top header.
 * Acts as a trigger for the GlobalSearch command palette.
 */
const HeaderSearch = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="desktop-search-trigger group flex items-center justify-between w-full max-w-[28rem] h-[2.3rem] border border-[var(--divider)] rounded-xl bg-[var(--surface-muted)] px-3 text-[var(--muted-text)] hover:bg-[var(--surface-ghost)] hover:border-[var(--accent-strong)]/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-strong)]/20 shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <Search size={16} className="text-[var(--muted-text)] group-hover:text-[var(--accent-strong)] transition-colors" />
          <span className="text-sm font-medium">Search notes, folders...</span>
        </div>
        
        <div className="flex items-center gap-1 text-[10px] font-bold opacity-60 bg-[var(--surface-ghost)] px-1.5 py-0.5 rounded border border-[var(--divider)]">
          <span className="text-[12px] leading-none mb-0.5">⌘</span>K
        </div>
      </button>

      <GlobalSearch open={open} onOpenChange={setOpen} />
    </>
  );
};

export default HeaderSearch;
