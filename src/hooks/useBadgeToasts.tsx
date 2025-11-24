import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useRewards } from "./useRewards";
import { BadgeToast } from "../components/BadgeToast";
import type { BadgeId } from "../components/badges/config";
import { BADGES } from "../components/badges/config";

type Theme = "day" | "night";

export function useBadgeToasts(theme: Theme, enabled: boolean) {
  const { data: rewardsRaw } = useRewards();

  // IDs rewardů, pro které už toast v téhle session proběhl
  const shownRewardIdsRef = useRef<Set<string>>(new Set());
  const initialisedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const rewards = Array.isArray(rewardsRaw)
      ? rewardsRaw
      : (rewardsRaw as any)?.items ?? [];

    if (!rewards || rewards.length === 0) return;

    // ✅ první run – jen si zapamatujeme existující rewardy
    if (!initialisedRef.current) {
      rewards.forEach((r: any) => {
        if (r?._id) shownRewardIdsRef.current.add(r._id);
      });
      initialisedRef.current = true;
      return;
    }

    // další runy – hledáme nové rewardy
    rewards.forEach((r: any) => {
      if (!r?._id || !r?.badge) return;
      if (shownRewardIdsRef.current.has(r._id)) return;

      const id = r.badge as BadgeId;
      if (!BADGES[id]) return; // safety

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