import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useRewards } from "./useRewards";
import { BadgeToast } from "../components/BadgeToast";
import type { BadgeId } from "../components/badges/config";
import { BADGES } from "../components/badges/config";

type Theme = "day" | "night";

const STORAGE_KEY = "hg_seen_reward_ids_v1";

type RewardItem = {
  _id: string;
  badge: string;
  earnedAt?: string;
};

function loadSeenIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x) => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function saveSeenIds(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    const arr = Array.from(set);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {
    // ignore
  }
}

export function useBadgeToasts(theme: Theme, enabled: boolean) {
  const { data: rewardsRaw } = useRewards();

  const [initialised, setInitialised] = useState(false);
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    const rewardsArr: RewardItem[] = Array.isArray(rewardsRaw)
      ? (rewardsRaw as RewardItem[])
      : (rewardsRaw as any)?.items ?? [];

    if (!rewardsArr) return;

    // logování pro debug – můžeš klidně nechat
    console.log("[BadgeToasts] enabled =", enabled, "raw =", rewardsRaw);

    // normalizace a filtrace na badge, které známe
    const rewards = rewardsArr.filter(
      (r) => r && typeof r._id === "string" && BADGES[r.badge as BadgeId]
    );

    console.log("[BadgeToasts] normalized rewards =", rewards);

    // první běh hooku – načteme seenIds z localStorage
    if (!initialised) {
      const fromStorage = loadSeenIds();
      seenRef.current = fromStorage;

      const now = Date.now();
      const FIVE_MIN = 5 * 60 * 1000;

      // pokud už máme něco v localStorage, bereme současné rewards jako „staré“
      // → jen je označíme jako seen (bez toastu)
      if (fromStorage.size > 0) {
        rewards.forEach((r) => {
          if (!seenRef.current.has(r._id)) {
            seenRef.current.add(r._id);
          }
        });
        saveSeenIds(seenRef.current);
        setInitialised(true);
        console.log(
          "[BadgeToasts] first run (returning user) – marking all as seen"
        );
        return;
      }

      // pokud je localStorage prázdný (úplně nový user / první session),
      // ukážeme toast jen pro „čerstvě“ získané badge (earnedAt < 5 min)
      rewards.forEach((r) => {
        const id = r._id;
        const badgeId = r.badge as BadgeId;
        if (!BADGES[badgeId]) return;

        let isFresh = true;
        if (r.earnedAt) {
          const earned = new Date(r.earnedAt).getTime();
          if (!Number.isNaN(earned)) {
            isFresh = now - earned <= FIVE_MIN;
          }
        }

        if (!isFresh) {
          // stará badge → jen označit jako seen
          seenRef.current.add(id);
          return;
        }

        // čerstvá badge → toast + označit jako seen
        seenRef.current.add(id);
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

      saveSeenIds(seenRef.current);
      setInitialised(true);
      console.log("[BadgeToasts] first run, localStorage empty – handled fresh");
      return;
    }

    // další běhy – hledáme nové rewardy, které ještě nejsou v seenRef
    rewards.forEach((r) => {
      const id = r._id;
      const badgeId = r.badge as BadgeId;
      if (!BADGES[badgeId]) return;

      if (seenRef.current.has(id)) {
        return;
      }

      seenRef.current.add(id);
      saveSeenIds(seenRef.current);

      console.log("[BadgeToasts] NEW reward → toast", id, badgeId);

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
  }, [enabled, rewardsRaw, theme, initialised]);
}