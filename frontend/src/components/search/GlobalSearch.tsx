import { useState, useEffect, useMemo, useRef } from "react";
import { Search, FileText, CornerDownLeft, X, Folder, Archive } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { useNotesQuery, useArchivedQuery } from "@/hooks/useNotesQuery";
import { useFolderStore } from "@/store/useFolderStore";
import { useNavigate } from "react-router-dom";
import { stripHtml } from "@/utils/stripHtml";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const Highlight = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-[var(--accent-soft)] text-[var(--accent-strong)] font-semibold rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

const GlobalSearch = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: notes = [] } = useNotesQuery();
  const { data: archived = [] } = useArchivedQuery();
  const { folders } = useFolderStore();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const allNotes = [...notes, ...archived].filter(n => !n.isDeleted);
    
    const matchedNotes = allNotes.map(note => {
      const plainContent = stripHtml(note.content);
      const titleMatch = note.title.toLowerCase().includes(q);
      const contentMatch = plainContent.toLowerCase().includes(q);

      if (!titleMatch && !contentMatch) return null;

      // Find best context snippet
      let snippet = "";
      if (contentMatch) {
         const index = plainContent.toLowerCase().indexOf(q);
         const start = Math.max(0, index - 40);
         const end = Math.min(plainContent.length, index + 80);
         snippet = (start > 0 ? "..." : "") + plainContent.slice(start, end) + (end < plainContent.length ? "..." : "");
      } else {
         snippet = plainContent.slice(0, 100) + (plainContent.length > 100 ? "..." : "");
      }

      return {
        type: "note",
        id: note._id,
        title: note.title || "Untitled Note",
        snippet,
        isArchived: note.isArchived,
        folderName: folders.find(f => f._id === note.folder)?.name || null
      };
    }).filter(Boolean);

    const matchedFolders = folders.map(f => {
        if (f.name.toLowerCase().includes(q)) {
            return {
                type: "folder",
                id: f._id,
                title: f.name,
                snippet: "Folder",
            };
        }
        return null;
    }).filter(Boolean);

    return [...matchedFolders, ...matchedNotes].slice(0, 10) as any[];
  }, [query, notes, archived, folders]);

  useEffect(() => {
    if (open) {
        setQuery("");
        setSelectedIndex(0);
        setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  const handleSelect = (item: any) => {
    if (item.type === "note") {
      navigate(item.isArchived ? `/archive/note/${item.id}` : `/note/${item.id}`);
    } else if (item.type === "folder") {
      navigate(`/folders/${item.id}`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden border-none bg-transparent shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Global Search</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col bg-[var(--panel-bg)] border border-[var(--divider)] rounded-2xl overflow-hidden shadow-2xl">
            {/* Search Input Area */}
            <div className="flex items-center px-4 py-4 border-bottom border-[var(--divider)] gap-3 bg-[var(--panel-bg-strong)]">
                <Search size={20} className="text-[var(--muted-text)]" />
                <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setSelectedIndex(0);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search for notes, folders, and ideas..."
                    className="flex-1 bg-transparent border-none outline-none text-lg text-[var(--text-strong)] placeholder:text-[var(--muted-text)]"
                />
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--surface-ghost)] text-[var(--muted-text)] text-[10px] font-bold uppercase tracking-wider">
                    Esc
                </div>
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                    {query.trim() === "" ? (
                        <div className="py-12 flex flex-col items-center justify-center text-[var(--muted-text)]">
                            <Search size={40} className="mb-4 opacity-20" />
                            <p className="text-sm font-medium">Type to search across everything</p>
                            <p className="text-xs opacity-60">Notes, Archive, Folders...</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-[var(--muted-text)]">
                            <X size={40} className="mb-4 opacity-20" />
                            <p className="text-sm font-medium">No results found for "{query}"</p>
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {results.map((item, index) => (
                                <button
                                    key={`${item.type}-${item.id}`}
                                    onClick={() => handleSelect(item)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 rounded-xl flex items-start gap-3 transition-colors group",
                                        index === selectedIndex ? "bg-[var(--active-surface)] shadow-sm" : "hover:bg-[var(--surface-ghost)]"
                                    )}
                                >
                                    <div className={cn(
                                        "mt-0.5 p-2 rounded-lg shrink-0",
                                        item.type === "note" ? "bg-blue-500/10 text-blue-500" : "bg-amber-500/10 text-amber-500"
                                    )}>
                                        {item.type === "note" ? (item.isArchived ? <Archive size={18} /> : <FileText size={18} />) : <Folder size={18} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="font-semibold text-[var(--text-strong)] truncate leading-tight">
                                                <Highlight text={item.title} query={query} />
                                            </h4>
                                            {item.folderName && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-text)] bg-[var(--surface-ghost)] px-1.5 py-0.5 rounded">
                                                    {item.folderName}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-[var(--muted-text)] line-clamp-1 mt-0.5 leading-relaxed">
                                            <Highlight text={item.snippet} query={query} />
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "mt-2 transition-opacity",
                                        index === selectedIndex ? "opacity-100" : "opacity-0"
                                    )}>
                                        <CornerDownLeft size={14} className="text-[var(--muted-text)]" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-[var(--divider)] bg-[var(--panel-bg-strong)] flex items-center justify-between text-[11px] text-[var(--muted-text)] font-medium">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-ghost)] border border-[var(--divider)]">↑↓</kbd>
                        Navigate
                    </span>
                    <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-ghost)] border border-[var(--divider)]">Enter</kbd>
                        Open
                    </span>
                </div>
                <div>
                    {results.length} results found
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearch;
