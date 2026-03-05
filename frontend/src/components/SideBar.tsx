import { ScrollArea } from "@/components/ui/scroll-area";
import NavItem from "./navItem";
import { FileText, Star, Archive, Trash2, Plus, Folder, Notebook } from "lucide-react";
const SideBar = () => {
  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-xl font-bold mb-6 tracking-wider px-2">
        Your Library
      </h2>
      <ScrollArea className="flex-1">
        <div className="space-y-6">
          <nav className="space-y-1">
            <NavItem to="/" icon={FileText} label="All Notes" />
            <NavItem to="/favorites" icon={Star} label="Favorites" />
            <NavItem to="/archive" icon={Archive} label="Archive" />
            <NavItem to="/trash" icon={Trash2} label="Trash" />
          </nav>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
                <h3 className="text-xs font-semibold text-zinc-500 tracking-wider">
                    Folders
                </h3>
                <button title="new-folder" className="text-zinc-500 hover:text-white transition-colors">
                    <Plus size={14} />
                </button>
            </div>
            <nav className="space-y-1">
                <NavItem to="/foler/work" icon={Folder} label="Work" />
                <NavItem to="/folder/ideas" icon={Folder} label="Ideas" />
            </nav>
          </div>

          {/* Recent Notes */}
          <div className="space-y-2 pb-4">
            <h3 className="px-3 text-xs font-semibold text-zinc-500 tracking-wider">
                Recent
            </h3>
            <nav className="space-y-1 opacity-80">
                <NavItem to="/note/1" icon={Notebook} label="Dsa Brainstorm" />
            </nav>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SideBar;
