export const BADGE_IDS = [
  "firstStep",
  "threeDayStreak",
  "fiveDayStreak",
  "weekWarrior",
  "powerUser",
  "legendary",
  "dedicated",
] as const;

export type BadgeId = (typeof BADGE_IDS)[number];

// podle toho, co máš v User schématu
export type UserLike = {
  _id: any;
  xp?: number;
  level?: number;
  currentStreak?: number;
  longestStreak?: number;
};

export const BADGE_RULES: { id: BadgeId; check: (u: UserLike) => boolean }[] = [
  {
    id: "firstStep",
    // první dokončený habit – XP > 0
    check: (u) => (u.xp ?? 0) >= 10,
  },
  {
    id: "threeDayStreak",
    check: (u) => (u.currentStreak ?? 0) >= 3,
  },
  {
    id: "fiveDayStreak",
    check: (u) => (u.currentStreak ?? 0) >= 5,
  },
  {
    id: "weekWarrior",
    check: (u) => (u.currentStreak ?? 0) >= 7,
  },
  {
    id: "powerUser",
    check: (u) => (u.level ?? 1) >= 10,
  },
  {
    id: "legendary",
    check: (u) => (u.longestStreak ?? 0) >= 100,
  },
  {
    id: "dedicated",
    check: (u) => (u.xp ?? 0) >= 10000,
  },
];