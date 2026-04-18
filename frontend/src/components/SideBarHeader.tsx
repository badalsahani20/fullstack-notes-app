import { LogOut, Settings, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "../assets/google.svg";

const SideBarHeader = () => {
  const {user, clearAuth} = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await api.post("users/logout");
    } catch (error) {
      console.error("Logout error", error);
    }finally{
      clearAuth();
      navigate("/login");
    }
  };

  const getInitials = (name: string) => {
    return name
      ? name.split(" ").map((n) => n[0]).join("").toUpperCase()
      : "??";
  };

  return (
    <div className="space-y-4 mb-4">
      <Dialog>
        <DialogTrigger asChild>
          <button className="group relative flex items-center justify-center p-0 h-10 w-10 mt-2 mb-2 rounded-full ring-2 ring-transparent hover:ring-zinc-700/50 transition-all duration-300 outline-none focus-visible:ring-zinc-500">
            <Avatar className="h-full w-full border border-zinc-800/80 shadow-md transition-transform duration-300 group-hover:scale-110">
              <AvatarImage src={user?.avatar || GoogleIcon} referrerPolicy="no-referrer" />
              <AvatarFallback className="bg-[#818cf8]/10 text-[#818cf8] font-bold text-xs tracking-wider">
                {getInitials(user?.name || "U")}
              </AvatarFallback>
            </Avatar>
          </button>
        </DialogTrigger>

        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Profile & Settings</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Manage your account actions and preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-zinc-800 transition-colors">
              <UserCircle size={18} /> Account Details
            </button>
            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-zinc-800 transition-colors">
              <Settings size={18} /> Preferences
            </button>
            <div className="h-px bg-zinc-800 my-2">
              <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">
                <LogOut size={18} /> Log Out
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SideBarHeader;
