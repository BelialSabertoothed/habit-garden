import { Heart, Leaf, Briefcase, Users, Palette } from "lucide-react";
import type { Habit } from "../hooks/useHabits";

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

  let resolvedIconId: HabitIconId;

  if (category === "Custom") {
    // Custom → použij to, co přijde z BE, jinak nějaký rozumný fallback
    resolvedIconId = iconId ?? "leaf";
  } else {
    // standardní kategorie → mapa category → icon
    resolvedIconId = iconByCategory[category as Exclude<HabitCategory, "Custom">];
  }

  const Icon = iconMap[resolvedIconId];

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
        <p className="font-medium truncate">{name}</p>
        <p
          className={`text-xs mt-0.5 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {category} • {frequency}
        </p>
      </div>
    </div>
  );
}