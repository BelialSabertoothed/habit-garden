import { Heart, Leaf, Briefcase, Users, Palette } from "lucide-react";
import type { Habit } from "../hooks/useHabits";
import { useTranslation } from "react-i18next";
import { SUGGESTED_HABITS_BY_CATEGORY } from "../data/suggestedHabits";

type HabitCategory = Habit["category"]; // "Health" | "Eco" | ...
type HabitIconId = Habit["icon"];       // "heart" | "leaf" | ...

const iconMap: Record<HabitIconId, typeof Heart> = {
  heart: Heart,
  leaf: Leaf,
  briefcase: Briefcase,
  users: Users,
  palette: Palette,
};

const iconByCategory: Record<Exclude<HabitCategory, "Custom">, HabitIconId> = {
  Health: "heart",
  Eco: "leaf",
  Productivity: "briefcase",
  Relationships: "users",
  Creativity: "palette",
};

const SUGGESTION_TITLE_MAP: Record<string, string> = {};
Object.values(SUGGESTED_HABITS_BY_CATEGORY)
  .flat()
  .forEach((h) => {
    SUGGESTION_TITLE_MAP[h.title] = h.titleKey;
  });

interface HabitCardProps {
  name: string;
  category: HabitCategory | "Custom";
  frequency: "Daily" | "Weekly";
  theme: "day" | "night";
  iconId?: HabitIconId;
}

export function HabitCard({
  name,
  category,
  frequency,
  theme,
  iconId,
}: HabitCardProps) {
  const isDark = theme === "night";
  const { t } = useTranslation();

  let resolvedIconId: HabitIconId;

  if (category === "Custom") {
    resolvedIconId = iconId ?? "leaf";
  } else {
    resolvedIconId =
      iconByCategory[category as Exclude<HabitCategory, "Custom">];
  }

  const Icon = iconMap[resolvedIconId];

  const translatedCategory = t(`habits.categories.${category}`);
  const translatedFrequency = t(`habits.frequency.${frequency}`);

  const translationKey = SUGGESTION_TITLE_MAP[name];
  const displayName = translationKey ? t(translationKey) : name;

  return (
    <div
      className={`rounded-2xl border shadow-sm p-4 flex items-center gap-4 ${
        isDark
          ? "bg-slate-800 border-slate-700 text-white"
          : "bg-white border-gray-100 text-gray-900"
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${
          isDark ? "bg-slate-700" : "bg-emerald-50"
        }`}
      >
        <Icon
          className={`w-6 h-6 ${
            isDark ? "text-emerald-300" : "text-emerald-600"
          }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{displayName}</p>
        <p
          className={`text-xs mt-0.5 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {translatedCategory} • {translatedFrequency}
        </p>
      </div>
    </div>
  );
}