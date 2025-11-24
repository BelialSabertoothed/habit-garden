import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../lib/api";
import type { User } from "../types";

// Pomocná funkce na detekci 401
export const isUnauthorized = (e: unknown) =>
  e instanceof ApiError && e.status === 401;

export function useMe() {
  return useQuery<User | null>({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const user = await api.get<User>("auth/me");
        return user;
      } catch (e) {
        // 401 = nepřihlášený → vrátíme null místo chyby
        if (isUnauthorized(e)) {
          return null;
        }
        throw e;
      }
    },
    retry: false,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<null>("auth/logout"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function loginWithGoogle() {
  const base = import.meta.env.VITE_API_URL as string; // končí /api/
  window.location.href = new URL("auth/google", base).toString();
}
