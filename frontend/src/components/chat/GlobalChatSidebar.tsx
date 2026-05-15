import { memo } from "react";
import { cn } from "@/lib/utils";
import { Bot, MessageSquarePlus, Clock } from "lucide-react";

// Helpers
const timeAgo = (iso: string) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

interface GlobalChatSidebarProps {
  isMobile: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sessions: any[];
  sessionsLoading: boolean;
  activeSessionId: string | null;
  loadSession: (id: string) => void;
  startNewChat: () => void;
}

export const GlobalChatSidebar = memo(({
  isMobile,
  sidebarOpen,
  setSidebarOpen,
  sessions,
  sessionsLoading,
  activeSessionId,
  loadSession,
  startNewChat,
}: GlobalChatSidebarProps) => {
  return (
    <>
      {/* Sidebar — desktop inline / mobile overlay */}
      {(isMobile && sidebarOpen) && (
        <div
          className="gc-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        "gc-sidebar",
        isMobile && "gc-sidebar-mobile",
        sidebarOpen ? "gc-sidebar-expanded" : "gc-sidebar-collapsed"
      )}>
        <div className="gc-sidebar-inner">
          <div className="gc-sidebar-header">
            <div className="gc-sidebar-brand">
              <Bot size={16} />
              <span>Conversations</span>
            </div>
            <button
              className="gc-new-chat-btn"
              onClick={startNewChat}
              title="New chat"
            >
              <MessageSquarePlus size={15} />
              <span>New Chat</span>
            </button>
          </div>

          <div className="gc-session-list custom-scrollbar">
            {sessionsLoading && sessions.length === 0 ? (
              <div className="gc-session-skeleton-wrap">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="gc-session-skeleton" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <p className="gc-session-empty">No conversations yet</p>
            ) : (
              sessions.map((session) => (
                <button
                  key={session._id}
                  className={`gc-session-item ${activeSessionId === session._id ? "gc-session-item-active" : ""}`}
                  onClick={() => { loadSession(session._id); if (isMobile) setSidebarOpen(false); }}
                >
                  <span className="gc-session-title">{session.title}</span>
                  <span className="gc-session-time">
                    <Clock size={10} />
                    {timeAgo(session.updatedAt)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  );
});
