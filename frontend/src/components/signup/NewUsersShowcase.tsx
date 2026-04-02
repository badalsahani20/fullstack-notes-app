import { useEffect, useState } from "react";
import api from "@/lib/api";

interface ShowcaseUser {
  id?: string;
  _id?: string;
  name: string;
  avatar?: string;
  provider?: "local" | "google";
}

const NewUsersShowcase = () => {
  const [users, setUsers] = useState<ShowcaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedAvatars, setFailedAvatars] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users/showcase");
        if (res.data && res.data.users) {
          setUsers(res.data.users);
        }
      } catch (error) {
        console.error("Failed to fetch showcase users", error);
        // Fallback or just empty
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return null;
  if (users.length === 0) return null;

  const getInitial = (name?: string) => {
    if (!name) return "U";
    return name.trim().charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="flex flex-col items-end gap-4 animate-in fade-in slide-in-from-top-6 duration-1000 delay-300">
      <div className="flex items-center justify-end gap-3">
        <div className="flex -space-x-3">
          {users.map((user, i) => {
            const userKey = user.id || user._id || String(i);
            const isBroken = failedAvatars[userKey];
            const useGoogleAvatar = user.provider === "google" && Boolean(user.avatar);
            const showFallback = !useGoogleAvatar || isBroken;
            return (
            <div
              key={userKey}
              className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-black/70 bg-zinc-900 shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-1"
            >
              {!showFallback ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="block h-full w-full object-cover"
                  onError={() =>
                    setFailedAvatars((prev) => ({ ...prev, [userKey]: true }))
                  }
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-200">
                  {getInitial(user.name)}
                </div>
              )}
            </div>
          )})}
          {/* Decorative "More" circle */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-zinc-500 ring-2 ring-black">
            +
          </div>
        </div>
      </div>
      
      <div className="space-y-1 text-right">
        <p className="text-sm font-medium text-white/90">
          Join <span className="text-indigo-400">100+ members</span>
        </p>
        <p className="text-[11px] leading-relaxed text-zinc-300">
          Capture ideas & organize <span className="text-indigo-400">notes</span> with AI.
        </p>
      </div>
    </div>
  );
};

export default NewUsersShowcase;
