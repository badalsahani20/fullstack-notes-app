import {
  CircleHelp,
  FileText,
  Folder,
  Settings,
  Star,
  Users,
} from "lucide-react";
import NavItem from "./navItem";

const ActivityBar = () => {
  return (
    <aside className="desktop-rail">
      <div className="flex-1 py-4 dark:bg-zinc-900">
        <nav className="flex w-full flex-col gap-2">
          <NavItem to="/" icon={FileText} label="Notes" />
          <NavItem to="/favorites" icon={Star} label="Favorites" />
          <NavItem to="/folders" icon={Folder} label="Folders" />
          <NavItem to="/shared" icon={Users} label="People" />
        </nav>
      </div>

      <div className="flex flex-col items-center gap-2 pb-4 dark:bg-zinc-900">
        <button className="desktop-icon-button desktop-rail-utility" type="button" aria-label="Help">
          <CircleHelp size={15} />
        </button>
        <button className="desktop-icon-button desktop-rail-utility" type="button" aria-label="Settings">
          <Settings size={15} />
        </button>
      </div>
    </aside>
  );
};

export default ActivityBar;
