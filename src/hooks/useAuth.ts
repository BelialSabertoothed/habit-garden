import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../lib/api";
import type { User } from "../types";

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
        if (isUnauthorized(e)) {
          return null;
        }
        throw e;
      }
    },
    retry: 0, 
    staleTime: 1000 * 60 * 2, 
    refetchOnWindowFocus: true, 
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<null>("auth/logout"),
    onSuccess: () => {
      qc.setQueryData(["me"], null);
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function loginWithGoogle() {
  const base = import.meta.env.VITE_API_URL as string; 
  window.location.href = new URL("auth/google", base).toString();
}