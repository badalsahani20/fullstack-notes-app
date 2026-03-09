// src/components/ActivityBar.tsx
import { FileText, Star, Archive, Trash2, Notebook, Settings } from "lucide-react";
import NavItem from "./navItem";
import FolderList from "./folderCard";
// import { ScrollArea } from "@/components/ui/scroll-area";

const ActivityBar = () => {
  return (
    <aside className="w-20 h-full bg-[#111111] border-r border-white/5 flex flex-col">
      
      {/* Scroll container */}
      <div className="flex-1 py-1">

        <nav className="flex flex-col w-full">
          <NavItem to="/" icon={FileText} label="Notes" />
          <NavItem to="/folders" icon={Notebook} label="Notebooks" />
          <NavItem to="/favorites" icon={Star} label="Favorites" />
          <NavItem to="/archive" icon={Archive} label="Archive" />
          <NavItem to="/trash" icon={Trash2} label="Trash" />
        </nav>

        <div className="w-10 h-px bg-zinc-800/50 my-4 mx-auto" />

      </div>

      <div className="mt-auto pb-2 flex justify-center">
        <Settings className="text-zinc-500 hover:text-white cursor-pointer transition-colors" size={20} />
      </div>
    </aside>
  );
};
export default ActivityBar;