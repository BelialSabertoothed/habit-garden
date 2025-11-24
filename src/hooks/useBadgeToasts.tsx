import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useRewards } from "./useRewards";
import { BadgeToast } from "../components/BadgeToast";
import type { BadgeId } from "../components/badges/config";
import { BADGES } from "../components/badges/config";

type Theme = "day" | "night";

const STORAGE_KEY = "hg_seen_rewards";

export function useBadgeToasts(theme: Theme, enabled: boolean) {
  const { data: rewardsRaw } = useRewards();

  const shownRewardIdsRef = useRef<Set<string>>(new Set());
  const initialisedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const rewards = Array.isArray(rewardsRaw)
      ? rewardsRaw
      : (rewardsRaw as any)?.items ?? [];

    if (!rewards || rewards.length === 0) return;

    // 🟢 FIRST RUN → init z localStorage a označit existující rewardy
    if (!initialisedRef.current) {
      const stored =
        JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") ?? [];

      shownRewardIdsRef.current = new Set(stored);

      rewards.forEach((r: any) => {
        if (r?._id) shownRewardIdsRef.current.add(r._id);
      });

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...shownRewardIdsRef.current])
      );

      initialisedRef.current = true;
      return;
    }

    // 🟣 OTHER RUNS → hledáme nové rewardy
    rewards.forEach((r: any) => {
      if (!r?._id || !r?.badge) return;

      if (shownRewardIdsRef.current.has(r._id)) return;

      const badgeId = r.badge as BadgeId;
      if (!BADGES[badgeId]) return;

      // označit jako seen
      shownRewardIdsRef.current.add(r._id);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...shownRewardIdsRef.current])
      );

      toast.custom(
        (t) => (
          <BadgeToast
            badgeId={badgeId}
            theme={theme}
            visible={t.visible}
          />
        ),
        {
          duration: 4000,
          position: "top-center",
        }
      );
    });
  }, [enabled, rewardsRaw, theme]);
}