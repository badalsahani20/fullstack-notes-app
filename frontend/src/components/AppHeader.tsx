import { Bell, Moon, Plus, Sun } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFolderStore } from "@/store/useFolderStore";
import { useNoteStore } from "@/store/useNoteStore";
import UserMenu from "@/components/header/UserMenu";
import HeaderSearch from "@/components/header/HeaderSearch";

type AppHeaderProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

const AppHeader = ({ theme, onToggleTheme }: AppHeaderProps) => {
  const { addFolder } = useFolderStore();
  const { createNote } = useNoteStore();
  const { folderId } = useParams();
  const navigate = useNavigate();

  const handleCreateNote = async () => {
    const newNote = await createNote(folderId || null);
    if (newNote?._id) {
      navigate(folderId ? `/folders/${folderId}/note/${newNote._id}` : `/note/${newNote._id}`);
    }
  };

  const handleCreateFolder = async () => {
    const name = window.prompt("Folder name");
    const normalized = name?.trim();
    if (!normalized) return;

    const folder = await addFolder(normalized);
    if (folder?._id) {
      navigate(`/folders/${folder._id}`);
    }
  };

  return (
    <header className="desktop-header">
      <div className="desktop-brand">
        <div className="desktop-brand-mark">NS</div>
        <div>
          {/* <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted-text)]">Workspace</p> */}
          <h1 className="text-[1.05rem] font-semibold tracking-[-0.04em] md:text-[1.15rem]">Notesify</h1>
        </div>
      </div>

      <HeaderSearch />

      <div className="desktop-header-actions">
        <button type="button" onClick={onToggleTheme} className="desktop-icon-button" aria-label="Toggle theme">
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button type="button" className="desktop-icon-button relative hidden sm:inline-flex" aria-label="Notifications">
          <Bell size={16} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[var(--panel-bg)]" />
        </button>
        <Button type="button" onClick={handleCreateNote} className="desktop-primary-button">
          <Plus size={15} />
          <span className="hidden sm:inline">New Note</span>
        </Button>
        <Button type="button" variant="outline" onClick={handleCreateFolder} className="desktop-secondary-button">
          <Plus size={15} />
          <span className="hidden sm:inline">New Folder</span>
        </Button>
        <UserMenu />
      </div>
    </header>
  );
};

export default AppHeader;
