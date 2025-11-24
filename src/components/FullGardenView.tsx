import { Sprout, Leaf, Flower2, TreeDeciduous } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getStageAndProgress, type Stage } from "../lib/growth";
import { useTranslation } from "react-i18next";

interface HabitView {
  id: string | number;
  name: string;
  frequency: "Daily" | "Weekly";
  currentStreak: number;
  bestStreak: number;
}

interface FullGardenViewProps {
  habits?: HabitView[];
  theme: "day" | "night";
}

/* ---------------- UI CONFIG ---------------- */

const stageConfig = {
  seed: {
    icon: Sprout,
    color: "from-amber-200 to-amber-300",
    size: "w-8 h-8",
    iconSize: "w-4 h-4",
  },
  sprout: {
    icon: Leaf,
    color: "from-green-300 to-green-400",
    size: "w-10 h-10",
    iconSize: "w-5 h-5",
  },
  flower: {
    icon: Flower2,
    color: "from-pink-300 to-rose-400",
    size: "w-12 h-12",
    iconSize: "w-6 h-6",
  },
  tree: {
    icon: TreeDeciduous,
    color: "from-emerald-400 to-green-500",
    size: "w-16 h-16",
    iconSize: "w-8 h-8",
  },
} as const;

type GardenStage = "empty" | "seed" | "sprout" | "flower" | "tree";

function resolveGardenStage(avg: number, plantCount: number): GardenStage {
  if (plantCount === 0) return "empty";
  if (avg >= 75) return "tree";
  if (avg >= 50) return "flower";
  if (avg >= 25) return "sprout";
  return "seed";
}

// backgrounds
const gardenBackgroundConfig: Record<
  GardenStage,
  {
    light: string;
    dark: string;
    blob: string;
  }
> = {
  empty: {
    light: "from-sky-50 via-slate-50 to-emerald-50",
    dark: "from-slate-950 via-slate-900 to-slate-950",
    blob: "bg-sky-200/40",
  },
  seed: {
    light: "from-emerald-50 via-lime-50 to-sky-50",
    dark: "from-slate-900 via-emerald-900/30 to-slate-950",
    blob: "bg-emerald-300/40",
  },
  sprout: {
    light: "from-emerald-50 via-teal-50 to-sky-100",
    dark: "from-slate-900 via-teal-900/30 to-slate-950",
    blob: "bg-teal-300/40",
  },
  flower: {
    light: "from-rose-50 via-pink-50 to-amber-50",
    dark: "from-slate-900 via-rose-900/30 to-slate-950",
    blob: "bg-rose-300/40",
  },
  tree: {
    light: "from-emerald-50 via-green-50 to-amber-50",
    dark: "from-slate-900 via-emerald-900/40 to-slate-950",
    blob: "bg-emerald-400/40",
  },
};

// LOCAL IMAGES in /public
const gardenImageConfig: Record<GardenStage, { day: string; night: string }> = {
  empty: {
    day: "/no-habit.png",
    night: "/no-habit.png",
  },
  seed: {
    day: "/seed-day.png",
    night: "/seed-night.png",
  },
  sprout: {
    day: "/sprout-day.png",
    night: "/sprout-night.png",
  },
  flower: {
    day: "/flower-day.png",
    night: "/flower-night.png",
  },
  tree: {
    day: "/tree-day.png",
    night: "/tree-night.png",
  },
};

/** klíče pro “extraEncouragement” – texty jsou v i18n JSONu */
const encouragementPoolKeys = [
  "dashboard.fullGarden.encouragement.pool.0",
  "dashboard.fullGarden.encouragement.pool.1",
  "dashboard.fullGarden.encouragement.pool.2",
  "dashboard.fullGarden.encouragement.pool.3",
  "dashboard.fullGarden.encouragement.pool.4",
  "dashboard.fullGarden.encouragement.pool.5",
  "dashboard.fullGarden.encouragement.pool.6",
  "dashboard.fullGarden.encouragement.pool.7",
  "dashboard.fullGarden.encouragement.pool.8",
  "dashboard.fullGarden.encouragement.pool.9",
] as const;

function pickStageEncouragementKey(avg: number, plantCount: number): string {
  if (plantCount === 0) {
    return "dashboard.fullGarden.encouragement.stage.empty";
  }
  if (avg < 25) {
    return "dashboard.fullGarden.encouragement.stage.veryLow";
  }
  if (avg < 50) {
    return "dashboard.fullGarden.encouragement.stage.low";
  }
  if (avg < 75) {
    return "dashboard.fullGarden.encouragement.stage.medium";
  }
  return "dashboard.fullGarden.encouragement.stage.high";
}

/* ---------------- COMPONENT ---------------- */

export function FullGardenView({ habits = [], theme }: FullGardenViewProps) {
  const isDark = theme === "night";
  const { t } = useTranslation();

  const safe = Array.isArray(habits) ? habits : [];

  const STAGE_BASE: Record<Stage, number> = {
    seed: 10,
    sprout: 35,
    flower: 70,
    tree: 95,
  };

  const STAGE_TOP: Record<Stage, number> = {
    seed: 35, // range 10–35
    sprout: 70, // range 35–70
    flower: 95, // range 70–95
    tree: 100, // range 95–100
  };

  // ⚙️ stage + progress sdílené s PlantCard (helper getStageAndProgress)
  const enriched = safe.map((h) => {
    const { stage, progress } = getStageAndProgress(
      h.frequency,
      h.currentStreak,
      h.bestStreak
    );

    // progress = 0–100 uvnitř stage
    const base = STAGE_BASE[stage];
    const top = STAGE_TOP[stage];
    const span = Math.max(1, top - base);

    // přepočet: 0–100% -> base–top
    const score = base + (span * progress) / 100;

    return {
      ...h,
      stage,
      progressInStage: progress,
      score,
    };
  });

  // 🌿 Garden health = průměr ze score (ne z „progress“)
  const totalScore = enriched.reduce((acc, h) => acc + h.score, 0);
  const averageProgress =
    enriched.length > 0 ? Math.round(totalScore / enriched.length) : 0;

  const gardenStage = resolveGardenStage(averageProgress, enriched.length);
  const bgCfg = gardenBackgroundConfig[gardenStage];
  const imgCfg = gardenImageConfig[gardenStage];
  const bgImageSrc = isDark ? imgCfg.night : imgCfg.day;

  const idx =
    (new Date().getDate() + enriched.length + averageProgress) %
    encouragementPoolKeys.length;

  const extraEncouragement = t(encouragementPoolKeys[idx]);
  const stageEncouragement = t(
    pickStageEncouragementKey(averageProgress, enriched.length)
  );

  // 🔹 nový, jednoduchý subtitle – jen počet rostlin, bez %
  const subtitleText =
    enriched.length === 0
      ? t("dashboard.fullGarden.subtitleEmptyShort")
      : t("dashboard.fullGarden.subtitleShort", { count: enriched.length });

  return (
    <div
      className={`${
        isDark
          ? "bg-slate-800 border-slate-700"
          : "bg-white/80 border-green-100"
      } rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md border transition-all duration-300`}
    >
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3
              className={`mb-1 text-lg sm:text-xl ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {t("dashboard.fullGarden.title")}
            </h3>

            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {subtitleText}
            </p>
          </div>

          <div
            className={`inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${
              isDark ? "bg-slate-700" : "bg-white/90"
            } border ${
              isDark ? "border-slate-600" : "border-green-200"
            } shadow-sm text-xs sm:text-sm`}
          >
            <span
              className={`${
                isDark ? "text-gray-300" : "text-gray-700"
              } flex items-center gap-1`}
            >
              🌱 {t("dashboard.fullGarden.healthLabel")}:{" "}
              <span className="font-semibold">{averageProgress}%</span>
            </span>
          </div>
        </div>

        {/* GARDEN VISUAL */}
        <div
          className={`relative rounded-xl overflow-hidden min-h-[220px] sm:min-h-[260px] lg:min-h-[280px] border ${
            isDark ? "border-slate-700" : "border-green-100"
          } bg-gradient-to-b ${
            isDark ? bgCfg.dark : bgCfg.light
          } transition-colors duration-700`}
        >
          {/* blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className={`absolute -left-10 bottom-0 w-32 h-32 rounded-full blur-3xl ${bgCfg.blob} animate-blob-animate`}
            />
            <div
              className={`absolute right-[-2rem] top-6 w-28 h-28 rounded-full blur-3xl ${bgCfg.blob} opacity-70 animate-blob-animate-reverse`}
            />
            <div
              className={`absolute left-1/3 -top-10 w-24 h-24 rounded-full blur-3xl ${bgCfg.blob} opacity-40 animate-blob-animate-slow`}
            />
          </div>

          {/* falling petals */}
          {gardenStage === "flower" && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute left-6 top-0 w-4 h-4 bg-rose-200/80 rounded-full animate-petalFall" />
              <div className="absolute right-10 top-[-8px] w-3 h-3 bg-pink-200/80 rounded-full animate-petalFall delay-1500" />
              <div className="absolute left-1/2 top-[-6px] w-3 h-3 bg-amber-100/80 rounded-full animate-petalFall delay-3000" />
            </div>
          )}

          {/* fireflies */}
          {gardenStage === "tree" && isDark && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute left-10 bottom-12 w-1.5 h-1.5 rounded-full bg-emerald-200/90 shadow-[0_0_10px_rgba(110,231,183,0.9)] animate-fireflyFloat" />
              <div className="absolute right-16 top-10 w-1.5 h-1.5 rounded-full bg-lime-200/90 shadow-[0_0_10px_rgba(190,242,100,0.9)] animate-fireflyFloat delay-2000" />
              <div className="absolute left-1/2 top-16 w-1.5 h-1.5 rounded-full bg-teal-200/90 shadow-[0_0_10px_rgba(45,212,191,0.9)] animate-fireflyFloat delay-3500" />
            </div>
          )}

          {/* background */}
          <div className="relative h-[220px] sm:h-[260px] lg:h-[280px]">
            <ImageWithFallback
              src={bgImageSrc}
              alt={t("dashboard.fullGarden.imageAlt")}
              className={`w-full h-full object-cover transition-all duration-700 ${
                isDark ? "opacity-35" : "opacity-70"
              }`}
            />

            <div
              className={`absolute inset-0 ${
                isDark
                  ? "bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent"
                  : "bg-gradient-to-t from-emerald-50/90 via-transparent to-sky-100/60"
              }`}
            />

            {/* white card */}
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div
                className={`${
                  isDark ? "bg-slate-900/90" : "bg-white/95"
                } backdrop-blur-sm rounded-2xl px-4 py-5 sm:px-6 sm:py-6 shadow-xl border ${
                  isDark ? "border-slate-700" : "border-emerald-100"
                } transform hover:scale-[1.02] transition-all duration-300 max-w-md w-full`}
              >
                {enriched.length > 0 ? (
                  <div className="text-center space-y-2">
                    <div
                      className={`text-xs sm:text-sm ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {t("dashboard.fullGarden.stats.progressLabel")}
                    </div>

                    <div className="flex items-baseline gap-2 justify-center">
                      <span
                        className={`text-4xl sm:text-5xl ${
                          isDark ? "text-green-400" : "text-green-600"
                        }`}
                      >
                        {averageProgress}
                      </span>
                      <span
                        className={`text-lg sm:text-xl ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        %
                      </span>
                    </div>

                    <div
                      className={`mt-1 text-xs sm:text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {averageProgress < 25 &&
                        t(
                          "dashboard.fullGarden.stats.progressMessages.veryLow"
                        )}
                      {averageProgress >= 25 &&
                        averageProgress < 50 &&
                        t("dashboard.fullGarden.stats.progressMessages.low")}
                      {averageProgress >= 50 &&
                        averageProgress < 75 &&
                        t("dashboard.fullGarden.stats.progressMessages.medium")}
                      {averageProgress >= 75 &&
                        t("dashboard.fullGarden.stats.progressMessages.high")}
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div
                      className={`text-xs sm:text-sm ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {t("dashboard.fullGarden.stats.emptyTitle")}
                    </div>
                    <p
                      className={`${
                        isDark ? "text-gray-400" : "text-gray-500"
                      } text-sm`}
                    >
                      {t("dashboard.fullGarden.stats.emptyText")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {(["seed", "sprout", "flower", "tree"] as const).map((stage) => {
            const count = enriched.filter((h) => h.stage === stage).length;
            const Icon = stageConfig[stage].icon;
            return (
              <div
                key={stage}
                className={`${
                  isDark ? "bg-slate-700/60" : "bg-white/80"
                } rounded-lg p-3 text-center border ${
                  isDark ? "border-slate-600" : "border-emerald-100"
                } flex flex-col items-center justify-center gap-1`}
              >
                <Icon
                  className={`w-5 h-5 mb-0.5 ${
                    isDark ? "text-gray-300" : "text-emerald-600"
                  }`}
                />
                <p className={isDark ? "text-white" : "text-gray-900"}>
                  {count}
                </p>
                <p
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {t(`dashboard.fullGarden.stageShort.${stage}`)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Encouragement */}
        <div
          className={`mt-2 text-sm sm:text-base rounded-xl px-4 py-3 ${
            isDark
              ? "bg-slate-800/80 text-gray-200"
              : "bg-emerald-50 text-emerald-900"
          } border ${
            isDark ? "border-slate-700" : "border-emerald-100"
          } shadow-sm`}
        >
          <p className="font-medium mb-1">
            {gardenStage === "empty"
              ? t("dashboard.fullGarden.cta.ready")
              : averageProgress >= 75
              ? t("dashboard.fullGarden.cta.keepGoing")
              : t("dashboard.fullGarden.cta.doingGreat")}
          </p>
          <p className="text-xs sm:text-sm opacity-90">
            {stageEncouragement}{" "}
            <span className="block sm:inline">{extraEncouragement}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
