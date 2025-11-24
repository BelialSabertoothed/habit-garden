import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export type WeeklyXpPoint = { day: string; xp: number };
export type HeatmapDay = { date: string; completed: boolean };

export type GrowthStats = {
  weekly: WeeklyXpPoint[];
  heatmap: HeatmapDay[];
  summary: {
    completedDaysThisWeek: number;
    totalXpThisWeek: number;
    currentStreak: number;
    totalDays: number;
  };
};

async function fetchGrowthStats(): Promise<GrowthStats> {
  const res = await api.get("stats/growth");
  const data =
    typeof (res as any).json === "function" ? await (res as any).json() : res;
  return data as GrowthStats;
}

export function useGrowthStats() {
  return useQuery({
    queryKey: ["stats", "growth"],
    queryFn: fetchGrowthStats,
    staleTime: 30_000,
  });
}