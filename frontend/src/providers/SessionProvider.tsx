import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader } from "lucide-react";
import { requestSessionRefresh } from "@/lib/api";

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const { clearAuth } = useAuthStore();

  useEffect(() => {
    // Start auth refresh immediately
    const initAuth = async () => {
      try {
        await requestSessionRefresh();
      } catch (error: any) {
        if ([401, 403].includes(error.response?.status)) {
          clearAuth();
        }
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [clearAuth]);

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#121212]">
        <Loader className="size-8 text-emerald-500 animate-spin" />
      </div>
    );

  return <>{children}</>;
};
