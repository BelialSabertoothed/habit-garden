import { BADGES, type BadgeId } from "./badges/config";

interface BadgeIconProps {
  type: BadgeId;
  unlocked: boolean;
  theme: "day" | "night";
  name: string;
  description?: string;
  icon?: any;
  color?: string;
  colorDark?: string;
}

export function BadgeIcon({ type, unlocked, theme }: BadgeIconProps) {
  const cfg = BADGES[type] ?? BADGES.firstStep;
  const Icon = cfg.icon;
  const isDark = theme === "night";

  return (
    <div
      className={`${
        isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"
      } rounded-xl p-5 shadow-sm border transition-all duration-200 ${
        unlocked ? "hover:shadow-md" : "opacity-50"
      }`}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div
          className={`
            w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all duration-200
            ${
              unlocked
                ? `bg-gradient-to-br ${isDark ? cfg.colorDark : cfg.color}`
                : isDark
                ? "bg-slate-700"
                : "bg-gray-200"
            }
          `}
        >
          <Icon
            className={`w-8 h-8 ${
              unlocked
                ? "text-white"
                : isDark
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          />
        </div>
        <div>
          <p className={`mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
            {cfg.name}
          </p>
          <p
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {cfg.description}
          </p>
        </div>
        {!unlocked && (
          <span
            className={`text-xs px-3 py-1 rounded-full ${
              isDark
                ? "bg-slate-700 text-gray-400"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            Locked
          </span>
        )}
      </div>
    </div>
  );
}
