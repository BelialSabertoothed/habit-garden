import { BADGES, type BadgeId } from "./badges/config";
import { useTranslation } from "react-i18next";

interface BadgeIconProps {
  type: BadgeId;
  unlocked: boolean;
  theme: "day" | "night";
  name?: string;
  description?: string;
  icon?: any;
  color?: string;
  colorDark?: string;
}

export function BadgeIcon({
  type,
  unlocked,
  theme,
  name,
  description,
  icon,
  color,
  colorDark,
}: BadgeIconProps) {
  const { t } = useTranslation();

  const cfg = BADGES[type] ?? BADGES.firstStep;
  const Icon = icon ?? cfg.icon;
  const isDark = theme === "night";

  const cfgAny = cfg as any;

  const displayName =
    name ??
    (cfgAny.nameKey ? t(cfgAny.nameKey) : cfgAny.name ?? type.toString());

  const displayDescription =
    description ??
    (cfgAny.descriptionKey
      ? t(cfgAny.descriptionKey)
      : cfgAny.description ?? "");

  const gradientClass = unlocked
    ? `bg-gradient-to-br ${
        isDark ? colorDark ?? cfgAny.colorDark : color ?? cfgAny.color
      }`
    : isDark
    ? "bg-slate-700"
    : "bg-gray-200";

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
            ${gradientClass}
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
            {displayName}
          </p>
          {displayDescription && (
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {displayDescription}
            </p>
          )}
        </div>
        {!unlocked && (
          <span
            className={`text-xs px-3 py-1 rounded-full ${
              isDark
                ? "bg-slate-700 text-gray-400"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {t("profile.badges.lockedLabel")}
          </span>
        )}
      </div>
    </div>
  );
}
