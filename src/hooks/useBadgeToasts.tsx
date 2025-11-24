import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useRewards } from "./useRewards";
import { BadgeToast } from "../components/BadgeToast";
import type { BadgeId } from "../components/badges/config";
import { BADGES } from "../components/badges/config";

type Theme = "day" | "night";

export function useBadgeToasts(theme: Theme, enabled: boolean) {
  const { data: rewardsRaw } = useRewards();

  const shownRewardIdsRef = useRef<Set<string>>(new Set());
  const initialisedRef = useRef(false);

  useEffect(() => {
    console.log("[BadgeToasts] enabled =", enabled, "raw =", rewardsRaw);

    if (!enabled) return;

    const rewards = Array.isArray(rewardsRaw)
      ? rewardsRaw
      : (rewardsRaw as any)?.items ?? [];

    console.log("[BadgeToasts] normalized rewards =", rewards);

    if (!rewards || rewards.length === 0) return;

    if (!initialisedRef.current) {
      console.log("[BadgeToasts] first run, marking existing as shown");
      rewards.forEach((r: any) => {
        if (r?._id) shownRewardIdsRef.current.add(r._id);
      });
      initialisedRef.current = true;
      return;
    }

    rewards.forEach((r: any) => {
      if (!r?._id || !r?.badge) return;
      if (shownRewardIdsRef.current.has(r._id)) return;

      const id = r.badge as BadgeId;
      if (!BADGES[id]) return;

      console.log("[BadgeToasts] NEW reward → toast", r);

      shownRewardIdsRef.current.add(r._id);

      toast.custom(
        (t) => (
          <BadgeToast
            badgeId={id}
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