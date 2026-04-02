import { useMemo } from "react";
import { ChevronDown, LogOut, Settings, User as UserIcon, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GoogleIcon from "@/assets/google.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import { toast } from "sonner";

/**
 * The user profile dropdown in the top header.
 * Handles displaying the user's name/avatar, and the logout action.
 */
const UserMenu = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 rounded-full ring-2 ring-transparent hover:ring-zinc-700/50 p-0 outline-none focus-visible:ring-zinc-500"
        >
          <Avatar className="h-9 w-9 border border-zinc-700/60 shadow-[0_4px_14px_rgba(0,0,0,0.5)]">
            <AvatarImage src={user?.avatar || GoogleIcon} referrerPolicy="no-referrer" />
            <AvatarFallback className="bg-[#818cf8]/10 text-[#818cf8] font-bold text-sm tracking-wider">
              {initials}
            </AvatarFallback>
          </Avatar>
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
        
        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => toast.info("Settings are coming soon!")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => toast.info("Subscriptions are coming soon!")}>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Subscriptions</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
