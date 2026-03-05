import { LogOut, Settings, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const SideBarHeader = () => {
  return (
    <div className="space-y-4 mb-4">
      <Dialog>
        <DialogTrigger asChild>
          <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-zinc-800/50 transition-all text-left">
            <Avatar className="h-9 w-9 border border-zinc-800">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-zinc-200 truncate">
                User Name
              </span>
              <span className="text-xs text-zinc-500">Free Plan</span>
            </div>
          </button>
        </DialogTrigger>

        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Profile & Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-zinc-800 transition-colors">
              <UserCircle size={18} /> Account Details
            </button>
            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-zinc-800 transition-colors">
              <Settings size={18} /> Preferences
            </button>
            <div className="h-px bg-zinc-800 my-2">
              <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">
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
