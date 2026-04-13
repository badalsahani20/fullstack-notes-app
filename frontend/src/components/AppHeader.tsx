import { Moon, Plus, Sun } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/header/UserMenu";
import HeaderSearch from "@/components/header/HeaderSearch";
import NotificationsMenu from "@/components/header/NotificationsMenu";
import { useState } from "react";
import NewNotebookDialog from "@/components/folders/NewNotebookDialog";

type AppHeaderProps = {
  theme: "light" | "dark";
  onToggleTheme: (event: React.MouseEvent) => void;
};

const AppHeader = ({ theme, onToggleTheme }: AppHeaderProps) => {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const [isNewNotebookOpen, setIsNewNotebookOpen] = useState(false);

  const handleCreateNote = () => {
    navigate(folderId ? `/folders/${folderId}/note/new` : `/note/new`);
  };

  const handleOpenNewNotebook = () => {
    setIsNewNotebookOpen(true);
  };

  return (
    <header className="desktop-header">
      <div className="desktop-brand">
        <div className="relative">
          <div className="absolute inset-0 rounded-lg bg-white/5 blur-md" />
          <img src="/notesify-favicon.png" alt="Notesify" width={32} height={32} className="relative shadow-[0_0_15px_rgba(255,255,255,0.05)]" />
        </div>
        <div>
          {/* <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted-text)]">Workspace</p> */}
          <h1 className="text-[1.05rem] font-semibold tracking-[-0.04em] md:text-[1.15rem]">Notesify</h1>
        </div>
      </div>

      <div className="desktop-header-search-slot">
        <HeaderSearch />
      </div>

      <div className="desktop-header-actions">
        <button type="button" onClick={(e) => onToggleTheme(e)} className="desktop-icon-button" aria-label="Toggle theme">
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <NotificationsMenu />
        <Button type="button" onClick={handleCreateNote} className="desktop-primary-button hidden md:inline-flex">
          <Plus size={15} />
          <span className="hidden sm:inline">New Note</span>
        </Button>
        <Button type="button" variant="outline" onClick={handleOpenNewNotebook} className="desktop-secondary-button hidden sm:inline-flex">
          <Plus size={15} />
          <span className="hidden sm:inline">New Notebook</span>
        </Button>
        <UserMenu />
      </div>

      <NewNotebookDialog 
        isOpen={isNewNotebookOpen} 
        onClose={() => setIsNewNotebookOpen(false)} 
      />
    </header>
  );
};

export default AppHeader;
