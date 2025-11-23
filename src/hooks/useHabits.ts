import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export type Habit = {
  _id: string;
  title: string;
  category:
    | "Health"
    | "Eco"
    | "Productivity"
    | "Relationships"
    | "Creativity"
    | "Custom";
  icon: "heart" | "leaf" | "briefcase" | "users" | "palette";
  frequency: "Daily" | "Weekly";
  active: boolean;
  streak?: number;
  bestStreak?: number;
  lastCompletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  worth: number;
};

// exportovaný key, ať ho můžou používat i další hooky
export const HABITS_KEY = ["habits", "mine"] as const;

async function fetchMine(): Promise<Habit[]> {
  const res = await api.get("habits/mine");
  const payload =
    typeof (res as any).json === "function" ? await (res as any).json() : res;

  const items = Array.isArray(payload) ? payload : payload?.items;
  return Array.isArray(items) ? (items as Habit[]) : [];
}

/* ---------------------------- list mine ---------------------------- */

export function useHabits() {
  return useQuery({
    queryKey: HABITS_KEY,
    queryFn: fetchMine,
    staleTime: 30_000,
  });
}

/* ---------------------------- tick / water ---------------------------- */

type TickResponse = {
  ok: boolean;
  habit?: {
    _id: string;
    streak?: number;
    bestStreak?: number;
    lastCompletedAt?: string;
  };
  me?: {
    xp?: number;
    level?: number;
    currentStreak?: number;
    longestStreak?: number;
    lastActiveDayKey?: string;
  };
};

export function useWaterHabit() {
  const qc = useQueryClient();

  return useMutation({
    // vracíme { id, ...data } – ať máme id i v onSuccess
    mutationFn: async (id: string) => {
      const res = await api.post(`habits/${id}/tick`, { json: {} });
      const data: TickResponse =
        typeof (res as any).json === "function"
          ? await (res as any).json()
          : res;
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
                      bestStreak:
                        typeof habit.bestStreak === "number"
                          ? habit.bestStreak
                          : h.bestStreak,
                      lastCompletedAt:
                        habit.lastCompletedAt ?? h.lastCompletedAt,
                    }
                  : h
              )
            : prev
        );
      }

      if (me) {
        qc.setQueryData(["me"], (old: any) => (old ? { ...old, ...me } : me));
      }
    },

    onError: (_err, _variables, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(HABITS_KEY, ctx.prev);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: HABITS_KEY });
      qc.invalidateQueries({ queryKey: ["rewards"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

/* ---------------------------- update habit ---------------------------- */

type UpdateHabitVariables = {
  id: string;
  // uživatel NESMÍ měnit worth / XP
  payload: Partial<
    Pick<Habit, "title" | "category" | "frequency" | "icon" | "active">
  >;
};

export function useUpdateHabit() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateHabitVariables) => {
      // pro jistotu odfiltrujeme worth, i kdyby se náhodou do payloadu dostal
      // (např. nějakým refactorem)
      const { /* worth, */ ...safePayload } = payload as any;

      const res = await api.patch(`habits/${id}`, { json: safePayload });
      const data =
        typeof (res as any).json === "function"
          ? await (res as any).json()
          : res;
      return data as Habit;
    },
    onSuccess: (updated) => {
      qc.setQueryData<Habit[] | undefined>(HABITS_KEY, (prev) =>
        prev
          ? prev.map((h) => (h._id === updated._id ? { ...h, ...updated } : h))
          : prev
      );
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: HABITS_KEY });
    },
  });
}

/* ---------------------------- delete habit ---------------------------- */

export function useDeleteHabit() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.del(`habits/${id}`);
      const data =
        typeof (res as any).json === "function"
          ? await (res as any).json()
          : res;
      return data as { ok: boolean };
    },
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: HABITS_KEY });
      const prev = qc.getQueryData<Habit[]>(HABITS_KEY);

      if (prev) {
        qc.setQueryData<Habit[]>(
          HABITS_KEY,
          prev.filter((h) => h._id !== id)
        );
      }

      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(HABITS_KEY, ctx.prev);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: HABITS_KEY });
    },
  });
}
