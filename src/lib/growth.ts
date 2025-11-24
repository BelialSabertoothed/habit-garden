export type Stage = "seed" | "sprout" | "flower" | "tree";
export type Frequency = "Daily" | "Weekly";

export const STAGE_ORDER: Stage[] = ["seed", "sprout", "flower", "tree"];

// hranice pro jednotlivé stage
// Daily: 0–2 = seed, 3–6 = sprout, 7–13 = flower, 14+ = tree
export const DAILY_THRESHOLDS = [0, 3, 7, 14] as const;

// Weekly: 0–1 = seed, 2–3 = sprout, 4–5 = flower, 6+ = tree
export const WEEKLY_THRESHOLDS = [0, 2, 4, 6] as const;

// jak daleko „dopředu“ počítáme progress v poslední stage
const LAST_STAGE_EXTRA = {
  Daily: 7,
  Weekly: 2,
} as const;

export function getThresholds(freq: Frequency): readonly number[] {
  return freq === "Daily" ? DAILY_THRESHOLDS : WEEKLY_THRESHOLDS;
}

/**
 * Stage podle bestStreaku (co nejde dolů, když user spadne).
 */
export function getStageIndexFromBestStreak(
  freq: Frequency,
  bestStreak: number
): number {
  const thresholds = getThresholds(freq);
  const safeBest = Math.max(0, bestStreak || 0);

  let stageIndex = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (safeBest >= thresholds[i]) {
      stageIndex = i;
    }
  }
  return stageIndex;
}

export function getStageFromBestStreak(
  freq: Frequency,
  bestStreak: number
): Stage {
  const idx = getStageIndexFromBestStreak(freq, bestStreak);
  return STAGE_ORDER[idx];
}

/**
 * Hlavní helper:
 * - stage je daná podle bestStreak (nezmenšuje se při ztrátě streaku)
 * - progress je daný podle currentStreak v rámci aktuální stage
 */
export function getStageAndProgress(
  freq: Frequency,
  currentStreak: number,
  bestStreak: number
): { stage: Stage; progress: number } {
  const thresholds = getThresholds(freq);

  const safeBest = Math.max(bestStreak, 0);
  const safeCurrent = Math.max(currentStreak, 0);

  const stageIndex = getStageIndexFromBestStreak(freq, safeBest);
  const stage = STAGE_ORDER[stageIndex];

  const lower = thresholds[stageIndex];
  const upper =
    stageIndex < thresholds.length - 1
      ? thresholds[stageIndex + 1]
      : thresholds[stageIndex] +
        (freq === "Daily" ? LAST_STAGE_EXTRA.Daily : LAST_STAGE_EXTRA.Weekly);

  const span = Math.max(1, upper - lower);

  // 👉 progress počítáme relativně k aktuální stage
  const raw = ((safeCurrent - lower) / span) * 100;

  const progress = Math.max(0, Math.min(100, raw));

  return { stage, progress };
}


export function getStageForStreak(
  freq: Frequency,
  streak: number
): Stage {
  return getStageFromBestStreak(freq, streak);
}