import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export type Habit = {
  _id: string;
  title: string;
  category: "Health" | "Eco" | "Productivity" | "Relationships";
  icon: "heart" | "leaf" | "briefcase" | "users";
  frequency: "Daily" | "Weekly";
  active: boolean;
  streak?: number;
  lastCompletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

async function fetchMine(): Promise<Habit[]> {
  const res = await api.get("habits/mine");
  const payload = typeof (res as any).json === "function" ? await (res as any).json() : res;

  const items = Array.isArray(payload) ? payload : payload?.items;
  console.log("🌿 /habits/mine parsed:", items);
  return Array.isArray(items) ? items : [];
}

export function useHabits() {
  return useQuery({
    queryKey: ["habits-mine"],
    queryFn: fetchMine,
    staleTime: 30_000,
  });
}

export function useWaterHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`habits/${id}/tick`, { json: {} });
    },
    // optimistický update streaku
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ["habits-mine"] });
      const prev = qc.getQueryData<Habit[]>(["habits-mine"]);
      if (prev) {
        const updated = prev.map((h) =>
          h._id === id ? { ...h, streak: (h.streak ?? 0) + 1, lastCompletedAt: new Date().toISOString() } : h
        );
        qc.setQueryData(["habits-mine"], updated);
      }
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(["habits-mine"], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["habits-mine"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
