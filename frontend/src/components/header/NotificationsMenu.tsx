import { Bell, CheckCircle2, Sparkles, AlertCircle, Info, X, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationStore, type AppNotification, timeAgo } from "@/store/useNotificationStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function NotificationsMenu() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { 
    notifications, 
    markAllAsRead, 
    markAsRead, 
    removeNotification 
  } = useNotificationStore();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success("All notifications marked as read");
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeNotification(id);
  };

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "ai":
        return <Sparkles className="h-4 w-4 text-purple-400" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-400" />;
      case "info":
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative inline-flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800/50 p-2 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-[var(--panel-bg)] shadow-[0_0_10px_rgba(244,63,94,0.5)]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 md:w-96 p-0 mt-1 border-zinc-200 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 backdrop-blur-xl shadow-xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden"
        align="end"
      >
        <DropdownMenuLabel className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/20">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto p-0 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-transparent transition-colors"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>

        <ScrollArea className="h-[350px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-zinc-400 dark:text-zinc-500 space-y-3">
              <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                <Bell size={24} className="text-zinc-400 dark:text-zinc-600 opacity-50" />
              </div>
              <p className="text-sm font-medium">You're all caught up!</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start gap-1 p-4 cursor-default transition-all border-b border-zinc-100 dark:border-white/5 last:border-0 ${
                    !notification.isRead
                      ? "bg-zinc-50 hover:bg-zinc-100 dark:bg-white/5 dark:hover:bg-white/10 focus:bg-zinc-100 dark:focus:bg-white/10"
                      : "opacity-80 hover:bg-zinc-50 dark:hover:bg-white/5 hover:opacity-100 focus:bg-zinc-50 dark:focus:bg-white/5"
                  }`}
                  onClick={() => {
                    // Prevent closing when clicking inner buttons
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md flex-shrink-0 ${!notification.isRead ? 'bg-zinc-100 dark:bg-zinc-800 dark:shadow-[inset_0_1px_rgba(255,255,255,0.1)]' : 'bg-transparent'}`}>
                        {getIcon(notification.type)}
                      </div>
                      <h4 className={`text-sm tracking-tight ${!notification.isRead ? 'text-zinc-900 dark:text-zinc-100 font-semibold' : 'text-zinc-600 dark:text-zinc-300 font-medium'}`}>
                        {notification.title.replace("{{name}}", user?.name?.split(" ")[0] || "there")}
                      </h4>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] uppercase font-medium text-zinc-400 dark:text-zinc-500 tracking-wider">
                        {timeAgo(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="pl-8 pr-6 w-full relative group">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {notification.message}
                    </p>
                    {notification.action && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                          navigate(notification.action!.href);
                        }}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                      >
                        {notification.action.label}
                        <ArrowRight size={11} />
                      </button>
                    )}
                    <button 
                      onClick={(e) => handleRemove(notification.id, e)}
                      className="absolute right-0 top-0 p-1 rounded-md text-zinc-400 dark:text-zinc-600 opacity-0 group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-rose-500 dark:hover:text-rose-400 transition-all focus:outline-none"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-2 border-t border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950/40">
            <Button variant="ghost" className="w-full text-xs h-8 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
              View all notification history
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
