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
    name: string;
    description: string;
    clue?: string;
    icon: any;
    color: string;
    colorDark: string;
  }
> = {
  firstStep: {
    name: "First Step",
    clue: "Complete your very first habit.",
    description: "Every journey begins with a single step.",
    icon: Star,
    color: "from-yellow-400 to-amber-500",
    colorDark: "from-yellow-600 to-amber-700",
  },

  threeDayStreak: {
    name: "Committed",
    clue: "3 days in a row.",
    description: "3-day streak! Your garden is waking up 🌱",
    icon: Flame,
    color: "from-orange-300 to-red-400",
    colorDark: "from-orange-500 to-red-600",
  },

  fiveDayStreak: {
    name: "Sprout Master",
    clue: "5 days in a row.",
    description: "5-day streak! Your sprouts are thriving 🌿",
    icon: Trophy,
    color: "from-amber-300 to-orange-500",
    colorDark: "from-amber-500 to-orange-700",
  },

  weekWarrior: {
    name: "Week Warrior",
    clue: "7 days in a row.",
    description: "7-day streak! Your garden is flourishing 🌳",
    icon: Flame,
    color: "from-orange-400 to-red-500",
    colorDark: "from-orange-600 to-red-700",
  },

  powerUser: {
    name: "Power User",
    clue: "Reach level 10.",
    description: "Level 10 achieved! Your garden salutes you ⚡",
    icon: Zap,
    color: "from-purple-400 to-pink-500",
    colorDark: "from-purple-600 to-pink-700",
  },

  legendary: {
    name: "Legendary",
    clue: "100 days in a row.",
    description: "100-day streak. Basically a habit deity.",
    icon: Crown,
    color: "from-yellow-400 to-amber-500",
    colorDark: "from-yellow-600 to-amber-700",
  },

  dedicated: {
    name: "Dedicated",
    clue: "Earn 10,000 XP.",
    description: "10,000 XP! Your dedication is unmatched.",
    icon: Shield,
    color: "from-green-400 to-emerald-500",
    colorDark: "from-green-600 to-emerald-700",
  },
};