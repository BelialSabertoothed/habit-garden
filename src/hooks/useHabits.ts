import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export type Habit = {
  _id: string;
  title: string;
  category: "Health" | "Eco" | "Productivity" | "Relationships" | "Creativity";
  icon: "heart" | "leaf" | "briefcase" | "users" | "palette";
  frequency: "Daily" | "Weekly";
  active: boolean;
  streak?: number;
  lastCompletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  worth: number;
};

/** stejná level křivka jako na BE – můžeš ji případně použít i na FE */
const levelMaxXp = (lvl: number) => ((lvl + 1) ** 2) * 100;
export const recalcLevel = (xp: number) => {
  let lvl = 1;
  while (xp >= levelMaxXp(lvl)) lvl += 1;
  return lvl;
};

async function fetchMine(): Promise<Habit[]> {
  const res = await api.get("habits/mine");
  const payload =
    typeof (res as any).json === "function" ? await (res as any).json() : res;

  const items = Array.isArray(payload) ? payload : payload?.items;
  return Array.isArray(items) ? items : [];
}

export function useHabits() {
  return useQuery({
    queryKey: ["habits-mine"],
    queryFn: fetchMine,
    staleTime: 30_000,
  });
}

type TickResponse = {
  ok: boolean;
  habit?: {
    _id: string;
    streak?: number;
    lastCompletedAt?: string;
  };
  me?: {
    xp?: number;
    currentStreak?: number;
    longestStreak?: number;
    level?: number;
  };
};

export function useWaterHabit() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<TickResponse> => {
      const res = await api.post(`habits/${id}/tick`, { json: {} });
      const data =
        typeof (res as any).json === "function" ? await (res as any).json() : res;
      return data as TickResponse;
    },

    // optimistický update streaku
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ["habits-mine"] });
      const prev = qc.getQueryData<Habit[]>(["habits-mine"]);

      if (prev) {
        const updated = prev.map((h) =>
          h._id === id
            ? {
                ...h,
                streak: (h.streak ?? 0) + 1,
                lastCompletedAt: new Date().toISOString(),
              }
            : h
        );
        qc.setQueryData(["habits-mine"], updated);
      }

      return { prev };
    },

    onSuccess: (data) => {
      // BE vrací snapshot me – rovnou ho mergneme do cache
      if (data?.me) {
        qc.setQueryData(["me"], (old: any) =>
          old ? { ...old, ...data.me } : data.me
        );
      }
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(["habits-mine"], ctx.prev);
      }
    },

    onSettled: () => {
      // pro jistotu refetch habits + profil
      qc.invalidateQueries({ queryKey: ["habits-mine"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
