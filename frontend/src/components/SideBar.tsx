import { Star, Archive, Trash2, Notebook, Settings, FileText } from "lucide-react";
import NavItem from "./navItem";

const ActivityBar = () => {
  return (
    <aside className="flex h-full w-20 flex-col border-r border-white/10 bg-[#141a29]/95 backdrop-blur-md">
      <div className="flex-1 py-3">
        <nav className="flex w-full flex-col gap-1">
          <NavItem to="/" icon={FileText} label="Notes" />
          <NavItem to="/folders" icon={Notebook} label="Notebooks" />
          <NavItem to="/favorites" icon={Star} label="Favorites" />
          <NavItem to="/archive" icon={Archive} label="Archive" />
          <NavItem to="/trash" icon={Trash2} label="Trash" />
        </nav>

        <div className="mx-auto my-4 h-px w-10 bg-white/10" />
      </div>

      <div className="mt-auto flex justify-center pb-3">
        <button className="rounded-lg border border-transparent p-2 text-zinc-400 transition hover:border-white/10 hover:bg-white/5 hover:text-zinc-100">
          <Settings size={18} />
        </button>
      </div>
    </aside>
  );
};

export default ActivityBar;
