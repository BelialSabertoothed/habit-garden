import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useCreateHabit() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      category: string;
      icon: string;
      frequency: "Daily" | "Weekly";
      worth: number;
    }) => {
      const res = await api.post("habits", { json: payload });
      return typeof (res as any).json === "function"
        ? await (res as any).json()
        : res;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits", "mine"] });
    },
  });
}
