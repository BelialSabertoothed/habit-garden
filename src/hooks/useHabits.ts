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

const HABITS_KEY = ["habits", "mine"] as const;

async function fetchMine(): Promise<Habit[]> {
  const res = await api.get("habits/mine");
  const payload =
    typeof (res as any).json === "function" ? await (res as any).json() : res;

  const items = Array.isArray(payload) ? payload : payload?.items;
  return Array.isArray(items) ? items : [];
}

export function useHabits() {
  return useQuery({
    queryKey: HABITS_KEY,
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
    level?: number;
    currentStreak?: number;
    longestStreak?: number;
  };
};

export function useWaterHabit() {
  const qc = useQueryClient();

  return useMutation({
    // vracíme { id, ...data } – ať máme id i v onSuccess
    mutationFn: async (id: string) => {
      const res = await api.post(`habits/${id}/tick`, { json: {} });
      const data: TickResponse =
        typeof (res as any).json === "function" ? await (res as any).json() : res;
      return { id, ...data };
    },

    // optimistic update – zvedneme streak + nastavíme lastCompletedAt už před odpovědí
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: HABITS_KEY });

      const prev = qc.getQueryData<Habit[]>(HABITS_KEY);

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
        qc.setQueryData(HABITS_KEY, updated);
      }

      return { prev };
    },

    // přesně dorovnáme podle toho, co vrátil BE + propsání do /me
    onSuccess: (result) => {
      const { id, habit, me } = result as { id: string } & TickResponse;

      if (habit) {
        qc.setQueryData<Habit[] | undefined>(HABITS_KEY, (prev) =>
          prev
            ? prev.map((h) =>
                h._id === id
                  ? {
                      ...h,
                      streak:
                        typeof habit.streak === "number"
                          ? habit.streak
                          : h.streak,
                      lastCompletedAt:
                        habit.lastCompletedAt ?? h.lastCompletedAt,
                    }
                  : h
              )
            : prev
        );
      }

      if (me) {
        qc.setQueryData(["me"], (old: any) =>
          old ? { ...old, ...me } : me
        );
      }
    },

    onError: (_err, _variables, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(HABITS_KEY, ctx.prev);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: HABITS_KEY });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}