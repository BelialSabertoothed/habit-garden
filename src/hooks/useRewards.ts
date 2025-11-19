import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export type RewardItem = {
  _id: string;
  badge?: string | null;
  earnedAt?: string;
};

async function fetchRewards(): Promise<RewardItem[]> {
  const res = await api.get("rewards");
  const payload =
    typeof (res as any).json === "function" ? await (res as any).json() : res;

  // BE ti vrací přímo pole, ale pro jistotu:
  if (Array.isArray(payload)) return payload;
  if (Array.isArray((payload as any)?.items)) return (payload as any).items;
  return [];
}

export function useRewards() {
  return useQuery({
    queryKey: ["rewards"],
    queryFn: fetchRewards,
    staleTime: 30_000,
  });
}