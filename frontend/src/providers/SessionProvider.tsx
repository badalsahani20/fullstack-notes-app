import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader } from "lucide-react";
import api from "@/lib/api";

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const { user, accessToken, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (user && accessToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.post("/users/refresh");

        const { user, accessToken } = res.data;
        setAuth(user, accessToken);
      } catch (error: unknown) {
        const status = typeof error === "object" && error && "response" in error
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;

        if (status === 400 || status === 401 || status === 403) {
          clearAuth();
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [accessToken, clearAuth, setAuth, user]);

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#121212]">
        <Loader className="size-8 text-emerald-500 animate-spin" />
      </div>
    );

  return <>{children}</>;
};
