import { Trophy, Star, Flame, Zap, Crown, Shield } from "lucide-react";

export type BadgeId =
  | "firstStep"
  | "threeDayStreak"
  | "fiveDayStreak"
  | "weekWarrior"
  | "powerUser"
  | "legendary"
  | "dedicated";

export const BADGES: Record<
  BadgeId,
  {
    nameKey: string;
    descriptionKey: string;
    clueKey?: string;
    icon: any;
    color: string;
    colorDark: string;
  }
> = {
  firstStep: {
    nameKey: "badges.firstStep.name",
    clueKey: "badges.firstStep.clue",
    descriptionKey: "badges.firstStep.description",
    icon: Star,
    color: "from-yellow-400 to-amber-500",
    colorDark: "from-yellow-600 to-amber-700",
  },

  threeDayStreak: {
    nameKey: "badges.threeDayStreak.name",
    clueKey: "badges.threeDayStreak.clue",
    descriptionKey: "badges.threeDayStreak.description",
    icon: Flame,
    color: "from-orange-300 to-red-400",
    colorDark: "from-orange-500 to-red-600",
  },

  fiveDayStreak: {
    nameKey: "badges.fiveDayStreak.name",
    clueKey: "badges.fiveDayStreak.clue",
    descriptionKey: "badges.fiveDayStreak.description",
    icon: Trophy,
    color: "from-amber-300 to-orange-500",
    colorDark: "from-amber-500 to-orange-700",
  },

  weekWarrior: {
    nameKey: "badges.weekWarrior.name",
    clueKey: "badges.weekWarrior.clue",
    descriptionKey: "badges.weekWarrior.description",
    icon: Flame,
    color: "from-orange-400 to-red-500",
    colorDark: "from-orange-600 to-red-700",
  },

  powerUser: {
    nameKey: "badges.powerUser.name",
    clueKey: "badges.powerUser.clue",
    descriptionKey: "badges.powerUser.description",
    icon: Zap,
    color: "from-purple-400 to-pink-500",
    colorDark: "from-purple-600 to-pink-700",
  },

  legendary: {
    nameKey: "badges.legendary.name",
    clueKey: "badges.legendary.clue",
    descriptionKey: "badges.legendary.description",
    icon: Crown,
    color: "from-yellow-400 to-amber-500",
    colorDark: "from-yellow-600 to-amber-700",
  },

  dedicated: {
    nameKey: "badges.dedicated.name",
    clueKey: "badges.dedicated.clue",
    descriptionKey: "badges.dedicated.description",
    icon: Shield,
    color: "from-green-400 to-emerald-500",
    colorDark: "from-green-600 to-emerald-700",
  },
};
