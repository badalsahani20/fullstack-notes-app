import { useMemo, useState } from "react";
import { Bell, ChevronDown, Moon, Plus, Search, Sun, LogOut, Settings, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import { useFolderStore } from "@/store/useFolderStore";
import { useNoteStore } from "@/store/useNoteStore";
import api from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AppHeaderProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

const AppHeader = ({ theme, onToggleTheme }: AppHeaderProps) => {
  const { user, clearAuth } = useAuthStore();
  const { addFolder } = useFolderStore();
  const { createNote } = useNoteStore();
  const { folderId } = useParams();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
    } catch (error) {
      console.error("Logout failed", error);
    }
    clearAuth();
    navigate("/login");
  };

  const initials = useMemo(() => {
    if (!user?.name) return "IN";
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name]);

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

      <div className="desktop-search-wrap">
        <Search size={16} className="desktop-search-icon" />
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search notes, folders, and ideas..."
          className="desktop-search-input"
        />
      </div>

      <div className="desktop-header-actions">
        <button type="button" onClick={onToggleTheme} className="desktop-icon-button" aria-label="Toggle theme">
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button type="button" className="desktop-icon-button relative" aria-label="Notifications">
          <Bell size={16} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[var(--panel-bg)]" />
        </button>
        <Button type="button" onClick={handleCreateNote} className="desktop-primary-button">
          <Plus size={15} />
          New Note
        </Button>
        <Button type="button" variant="outline" onClick={handleCreateFolder} className="desktop-secondary-button">
          <Plus size={15} />
          New Folder
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="desktop-profile cursor-pointer hover:bg-white/5 transition-colors rounded-md p-1">
              <Avatar className="h-8 w-8 border border-[var(--divider)]">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-[13px] font-semibold leading-tight">{user?.name || "Guest"}</p>
                <p className="text-xs text-[var(--muted-text)]">{user?.email || "Research workspace"}</p>
              </div>
              <ChevronDown size={14} className="text-[var(--muted-text)]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || "Guest"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email || "No email"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppHeader;
