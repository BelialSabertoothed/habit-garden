import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { api, ApiError } from "../lib/api";
import type { User } from "../types";
import { getAccessToken, onTokenChange } from "../lib/authToken";

export function useMe() {
  const [token, setToken] = useState<string | null>(() => getAccessToken());

  useEffect(() => {
    const unsubscribe = onTokenChange(setToken);
    return () => {
      // call unsubscribe and ignore its boolean return value so cleanup returns void
      unsubscribe();
    };
  }, []);

  return useQuery({
    queryKey: ["me", token],             // token v key – změna => re-fetch
    queryFn: () => api.get<User>("auth/me"),
    enabled: !!token,                    // volat jen s tokenem
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

export const isUnauthorized = (e: unknown) =>
  e instanceof ApiError && e.status === 401;
