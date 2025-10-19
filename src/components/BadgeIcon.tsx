import { Trophy, Star, Flame, Zap, Crown, Shield } from "lucide-react";

interface BadgeIconProps {
  type: keyof typeof badgeConfig;
  unlocked: boolean;
  name: string;
  description: string;
  theme: "day" | "night";
}

type LucideIconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const badgeConfig: Record<
  string,
  { icon: LucideIconType; color: string; colorDark: string }
> = {
  firstStep: {
    icon: Star,
    color: "from-yellow-400 to-amber-500",
    colorDark: "from-yellow-600 to-amber-700",
  },
  weekWarrior: {
    icon: Flame,
    color: "from-orange-400 to-red-500",
    colorDark: "from-orange-600 to-red-700",
  },
  consistent: {
    icon: Trophy,
    color: "from-blue-400 to-indigo-500",
    colorDark: "from-blue-600 to-indigo-700",
  },
  powerUser: {
    icon: Zap,
    color: "from-purple-400 to-pink-500",
    colorDark: "from-purple-600 to-pink-700",
  },
  legendary: {
    icon: Crown,
    color: "from-amber-400 to-yellow-500",
    colorDark: "from-amber-600 to-yellow-700",
  },
  dedicated: {
    icon: Shield,
    color: "from-green-400 to-emerald-500",
    colorDark: "from-green-600 to-emerald-700",
  },
};

export function BadgeIcon({
  type,
  unlocked,
  name,
  description,
  theme,
}: BadgeIconProps) {
  const config = badgeConfig[type] ?? badgeConfig.firstStep;
  const Icon = config.icon;
  const isDark = theme === "night";

  return (
    <div
      className={`${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"} rounded-xl p-5 shadow-sm border transition-all duration-200 ${
        unlocked ? "hover:shadow-md" : "opacity-50"
      }`}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div
          className={`
            w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all duration-200
            ${
              unlocked
                ? `bg-gradient-to-br ${isDark ? config.colorDark : config.color}`
                : isDark
                ? "bg-slate-700"
                : "bg-gray-200"
            }
          `}
        >
          <Icon
            className={`w-8 h-8 ${
              unlocked ? "text-white" : isDark ? "text-gray-500" : "text-gray-400"
            }`}
          />
        </div>
        <div>
          <p className={`mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
            {name}
          </p>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {description}
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
