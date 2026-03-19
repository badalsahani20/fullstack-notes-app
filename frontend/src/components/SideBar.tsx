import {
  FileText,
  Folder,
  Search,
  Settings,
  Star,
} from "lucide-react";
import NavItem from "./navItem";
import { useParams } from "react-router-dom";

import { useState } from "react";
import { useNoteStore } from "@/store/useNoteStore";

const ActivityBar = () => {
  const { noteId } = useParams();
  const { searchQuery, setSearchQuery } = useNoteStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <aside className="desktop-rail">
      <div className="flex-1 flex sm:block py-2 sm:py-4 dark:bg-zinc-900 overflow-hidden">
        {isSearchOpen ? (
          <div className="flex items-center w-full px-3 gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
            <Search size={16} className="text-[var(--muted-text)] shrink-0" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-strong)] placeholder:text-[var(--muted-text)]"
              onBlur={() => !searchQuery && setIsSearchOpen(false)}
            />
            <button 
              onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
              className="text-[var(--muted-text)] hover:text-[var(--text-strong)] text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        ) : (
          <nav className="flex w-full flex-row sm:flex-col gap-2 justify-around sm:justify-start">
            <NavItem to={noteId ? `/note/${noteId}` : "/"} icon={FileText} label="Notes" />
            <NavItem to={noteId ? `/favorites/note/${noteId}` : "/favorites"} icon={Star} label="Favorites" />
            <NavItem to="/folders" icon={Folder} label="Folders" />
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-md text-(--muted-text) hover:bg-white/5 hover:text-[#d1d5db] transition sm:hidden"
              title="Search"
            >
              <Search size={16} />
            </button>
          </nav>
        )}
      </div>

      <div className="flex flex-row sm:flex-col items-center gap-2 px-2 sm:px-0 pb-2 sm:pb-4 dark:bg-zinc-900">
        <button className="desktop-icon-button desktop-rail-utility" type="button" aria-label="Settings">
          <Settings size={15} />
        </button>
      </div>
    </aside>
  );
};

export default ActivityBar;
