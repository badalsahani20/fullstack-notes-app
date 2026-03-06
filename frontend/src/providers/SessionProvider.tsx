import { useEffect, useState } from "react";
// import api from '../lib/api';
import { useAuthStore } from "@/store/useAuthStore";
import { Loader } from "lucide-react";
import api from "@/lib/api";

let isRefreshing = false;
export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const { setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if(isRefreshing) return;
      isRefreshing = true;
      try {
        const res = await api.post("/users/refresh");

        const { user, accessToken } = res.data;
        setAuth(user, accessToken);

      } catch {
        console.log("Session expired or user not logged in");
        clearAuth();
      } finally {
        setLoading(false);
        isRefreshing = false;
      }
    };

    initAuth();
  }, [setAuth, clearAuth]);

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#121212]">
        <Loader className="size-8 text-emerald-500 animate-spin" />
      </div>
    );

  return <>{children}</>;
};