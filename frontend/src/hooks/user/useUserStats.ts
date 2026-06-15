import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface UserStats {
  notesCount: number;
  aiCount: number;
  limit: number;
  name: string;
  email: string;
  avatar?: string;
  provider: "local" | "google";
  isVerified: boolean;
  memberSince: string;
}

const fetchUserStats = async (): Promise<UserStats> => {
  const res = await api.get("/user/stats");
  return res.data.stats;
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ["user", "stats"],
    queryFn: fetchUserStats,
    staleTime: 0, // 0 ensures it fetches immediately on mount/focus
    retry: 1,
  });
};
