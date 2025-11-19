import { Sprout, Leaf, Flower2, TreeDeciduous } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface HabitView {
  id: string | number;
  name: string;
  stage: "seed" | "sprout" | "flower" | "tree";
  streak: number;
}

interface FullGardenViewProps {
  habits?: HabitView[];
  theme: "day" | "night";
}

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
const gardenImageConfig: Record<
  GardenStage,
  { day: string; night: string }
> = {
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

const encouragementPool = [
  "Tiny drops today grow tomorrow’s forest.",
  "You’re building roots, not just checking boxes.",
  "Future you is quietly cheering for every tiny habit you water.",
  "Consistency beats intensity – and you’re showing up.",
  "Even one small habit keeps your garden alive today.",
  "Your garden doesn’t need perfect days, just cared-for ones.",
  "Look at you, growing a whole ecosystem of good habits.",
  "Rest is also part of growth – you’re allowed to go slow.",
  "Every time you come back, your habits notice. They’re proud of you.",
  "You’re not starting from zero – you’re starting from experience.",
];

function pickEncouragement(avg: number, plantCount: number) {
  if (plantCount === 0) {
    return "Every forest starts with a single seed. Add your first habit to begin. 🌱";
  }
  if (avg < 25) return "You’ve planted the seeds, now a few drops of consistency will do the magic.";
  if (avg < 50) return "Your garden is waking up. Even a tiny action today keeps it growing.";
  if (avg < 75) return "You’re in the blooming zone, keep watering what matters to you.";
  return "Your garden is thriving. Don’t forget to be proud of how far you’ve come.";
}

export function FullGardenView({ habits = [], theme }: FullGardenViewProps) {
  const isDark = theme === "night";

  const safe = Array.isArray(habits) ? habits : [];

  //
  // 🌱 NEW PERCENT LOGIC
  //
  const stageValues = {
    seed: 10,
    sprout: 33,
    flower: 66,
    tree: 100,
  } as const;

  const totalProgress = safe.reduce(
    (acc, h) => acc + stageValues[h.stage],
    0
  );

  const averageProgress =
    safe.length > 0 ? Math.round(totalProgress / safe.length) : 0;

  const gardenStage = resolveGardenStage(averageProgress, safe.length);
  const bgCfg = gardenBackgroundConfig[gardenStage];
  const imgCfg = gardenImageConfig[gardenStage];
  const bgImageSrc = isDark ? imgCfg.night : imgCfg.day;

  const idx =
    (new Date().getDate() + safe.length + averageProgress) %
    encouragementPool.length;

  const extraEncouragement = encouragementPool[idx];
  const stageEncouragement = pickEncouragement(averageProgress, safe.length);

  return (
    <div
      className={`${
        isDark ? "bg-slate-800 border-slate-700" : "bg-white/80 border-green-100"
      } rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md border transition-all duration-300`}
    >
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className={`mb-1 text-lg sm:text-xl ${isDark ? "text-white" : "text-gray-900"}`}>
              Your Complete Garden
            </h3>

            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {safe.length} {safe.length === 1 ? "plant" : "plants"} growing •{" "}
              {averageProgress}% average growth
            </p>
          </div>

          <div
            className={`inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${
              isDark ? "bg-slate-700" : "bg-white/90"
            } border ${
              isDark ? "border-slate-600" : "border-green-200"
            } shadow-sm text-xs sm:text-sm`}
          >
            <span className={`${isDark ? "text-gray-300" : "text-gray-700"} flex items-center gap-1`}>
              🌱 Garden Health: <span className="font-semibold">{averageProgress}%</span>
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
            <div className={`absolute -left-10 bottom-0 w-32 h-32 rounded-full blur-3xl ${bgCfg.blob} blob-animate`} />
            <div className={`absolute right-[-2rem] top-6 w-28 h-28 rounded-full blur-3xl ${bgCfg.blob} opacity-70 blob-animate-reverse`} />
            <div className={`absolute left-1/3 -top-10 w-24 h-24 rounded-full blur-3xl ${bgCfg.blob} opacity-40 blob-animate-slow`} />
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
              alt="Your habit garden"
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
                {safe.length > 0 ? (
                  <div className="text-center space-y-2">
                    <div className={`text-xs sm:text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                      Garden Progress
                    </div>

                    <div className="flex items-baseline gap-2 justify-center">
                      <span className={`text-4xl sm:text-5xl ${isDark ? "text-green-400" : "text-green-600"}`}>
                        {averageProgress}
                      </span>
                      <span className={`text-lg sm:text-xl ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        %
                      </span>
                    </div>

                    <div className={`mt-1 text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {averageProgress < 25 &&
                        "🌱 Just planted – every check-in helps roots grow."}
                      {averageProgress >= 25 && averageProgress < 50 &&
                        "🌿 Sprouting nicely – your habits are waking up."}
                      {averageProgress >= 50 && averageProgress < 75 &&
                        "🌸 Blooming beautifully – you’re building real momentum."}
                      {averageProgress >= 75 &&
                        "🌳 Flourishing garden – this is what consistency looks like."}
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className={`text-xs sm:text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                      Your garden is empty
                    </div>
                    <p className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}>
                      Add your first habit to plant the very first seed. 🌱
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
            const count = safe.filter((h) => h.stage === stage).length;
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
                <Icon className={`w-5 h-5 mb-0.5 ${isDark ? "text-gray-300" : "text-emerald-600"}`} />
                <p className={isDark ? "text-white" : "text-gray-900"}>
                  {count}
                </p>
                <p
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  } capitalize`}
                >
                  {stage}
                  {count !== 1 ? "s" : ""}
                </p>
              </div>
            );
          })}
        </div>

        {/* Encouragement */}
        <div
          className={`mt-2 text-sm sm:text-base rounded-xl px-4 py-3 ${
            isDark ? "bg-slate-800/80 text-gray-200" : "bg-emerald-50 text-emerald-900"
          } border ${isDark ? "border-slate-700" : "border-emerald-100"} shadow-sm`}
        >
          <p className="font-medium mb-1">
            {gardenStage === "empty"
              ? "Ready to start?"
              : averageProgress >= 75
              ? "Keep going!"
              : "You’re doing great"}
          </p>
          <p className="text-xs sm:text-sm opacity-90">
            {stageEncouragement} <span className="block sm:inline">{extraEncouragement}</span>
          </p>
        </div>
      </div>
    </div>
  );
}