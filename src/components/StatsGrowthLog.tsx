import { TrendingUp, Calendar, Sparkles } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useGrowthStats } from "../hooks/useStats";
import { useMe } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";

interface StatsGrowthLogProps {
  theme: "day" | "night";
}

function buildHeatmapWeeks(
  cells: { date: string; completed: boolean }[]
): number[][] {
  if (!cells.length) return [];
  const weeks: number[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    const slice = cells.slice(i, i + 7);
    weeks.push(slice.map((c) => (c.completed ? 1 : 0)));
  }
  return weeks;
}

export function StatsGrowthLog({ theme }: StatsGrowthLogProps) {
  const isDark = theme === "night";
  const { data, isLoading, isError } = useGrowthStats();
  const { data: me } = useMe();
  const { t } = useTranslation();

  const isGamified = (me?.experimentVariant ?? "gamified") === "gamified";

  const weeklyData = data?.weekly ?? [];
  const heatmapWeeks = buildHeatmapWeeks(data?.heatmap ?? []);

  const completedDays = data?.summary.completedDaysThisWeek ?? 0;
  const totalXp = data?.summary.totalXpThisWeek ?? 0;
  const currentStreak = data?.summary.currentStreak ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={isDark ? "text-white" : "text-gray-900"}>
          {t("stats.growthLog.title")}
        </h2>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          {t("stats.growthLog.subtitle")}
        </p>
      </div>

      {/* Motivational Summary */}
      <div
        className={`${
          isDark
            ? "bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-800"
            : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
        } rounded-2xl p-6 border`}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3
              className={`mb-1 ${
                isDark ? "text-white" : "text-green-900"
              }`}
            >
              {isError
                ? t("stats.growthLog.summary.errorTitle")
                : t("stats.growthLog.summary.successTitle")}
            </h3>
            <p className={isDark ? "text-gray-300" : "text-green-700"}>
              {isLoading && t("stats.growthLog.summary.loading")}
              {!isLoading && !isError && (
                <>
                  {t("stats.growthLog.summary.prefix")}{" "}
                  <strong>
                    {t("stats.growthLog.summary.daysOfWeek", {
                      completedDays,
                    })}
                  </strong>{" "}
                  {t("stats.growthLog.summary.thisWeek")}{" "}
                  {isGamified && (
                    <>
                      {t("stats.growthLog.summary.earnedXpPrefix")}{" "}
                      <strong>{totalXp}</strong>{" "}
                      {t("stats.growthLog.summary.earnedXpSuffix")}{" "}
                      {t("stats.growthLog.summary.andOnStreak")}{" "}
                    </>
                  )}
                  {!isGamified && (
                    <>
                      {t("stats.growthLog.summary.streakOnlyPrefix")}{" "}
                    </>
                  )}
                  <strong>
                    {t("stats.growthLog.summary.streakValue", {
                      currentStreak,
                    })}
                  </strong>{" "}
                  {t("stats.growthLog.summary.streakSuffixEmoji")}
                </>
              )}
              {isError && t("stats.growthLog.summary.error")}
            </p>
          </div>
        </div>
      </div>

      {/* Weekly XP Chart – jen pro gamifikovanou variantu */}
      {isGamified && (
        <div
          className={`${
            isDark
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-100"
          } rounded-2xl p-4 sm:p-6 shadow-md border`}
        >
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className={isDark ? "text-white" : "text-gray-900"}>
              {t("stats.growthLog.weeklyChart.title")}
            </h3>
          </div>

          {isLoading ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
              {t("stats.growthLog.weeklyChart.loading")}
            </div>
          ) : weeklyData.length === 0 ? (
            <div className="h-[120px] flex items-center justify-center text-sm text-gray-400">
              {t("stats.growthLog.weeklyChart.empty")}
            </div>
          ) : (
            <div className="w-full">
              <ResponsiveContainer
                width="100%"
                height={260}
                minWidth={0}
                minHeight={200}
              >
                <LineChart
                  data={weeklyData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#374151" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="day"
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    tick={{ fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1e293b" : "#ffffff",
                      border: `1px solid ${
                        isDark ? "#475569" : "#e5e7eb"
                      }`,
                      borderRadius: "8px",
                      color: isDark ? "#ffffff" : "#000000",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="xp"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Streak Heatmap */}
      <div
        className={`${
          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"
        } rounded-2xl p-6 shadow-md border`}
      >
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h3 className={isDark ? "text-white" : "text-gray-900"}>
            {t("stats.growthLog.heatmap.title")}
          </h3>
          <span
            className={`ml-auto text-sm ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {t("stats.growthLog.heatmap.rangeLabel")}
          </span>
        </div>

        {isLoading ? (
          <div className="h-[120px] flex items-center justify-center text-sm text-gray-400">
            {t("stats.growthLog.heatmap.loading")}
          </div>
        ) : heatmapWeeks.length === 0 ? (
          <div className="h-[120px] flex items-center justify-center text-sm text-gray-400">
            {t("stats.growthLog.heatmap.empty")}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {heatmapWeeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex gap-2">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`
                        w-full h-8 sm:h-10 rounded-lg transition-all duration-200
                        ${
                          day === 1
                            ? "bg-gradient-to-br from-green-400 to-emerald-500 shadow-sm"
                            : isDark
                            ? "bg-slate-700"
                            : "bg-gray-100"
                        }
                      `}
                      title={
                        day === 1
                          ? t("stats.growthLog.heatmap.completed")
                          : t("stats.growthLog.heatmap.missed")
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <span
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {t("stats.growthLog.heatmap.lessActive")}
              </span>
              <div className="flex gap-1">
                <div
                  className={`w-6 h-6 rounded ${
                    isDark ? "bg-slate-700" : "bg-gray-100"
                  }`}
                />
                <div className="w-6 h-6 rounded bg-green-200" />
                <div className="w-6 h-6 rounded bg-green-400" />
                <div className="w-6 h-6 rounded bg-green-500" />
              </div>
              <span
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {t("stats.growthLog.heatmap.moreActive")}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
