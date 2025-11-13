import { useState, useEffect, useRef } from "react";
import { Plus, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { FullGardenView } from "./FullGardenView";
import { PlantCard } from "./PlantCard";
import { AddHabitModal } from "./AddHabitModal";
import { useHabits, useWaterHabit } from "../hooks/useHabits";
import { useMe } from "../hooks/useAuth";

/* stejné level křivce jako na BE */
const levelMaxXp = (lvl: number) => ((lvl + 1) ** 2) * 100;

function levelProgress(xp: number, level: number) {
  const currCap = levelMaxXp(level);
  const prevCap = level > 1 ? levelMaxXp(level - 1) : 0;
  const span = currCap - prevCap;
  if (span <= 0) return { progress: 0, xpToNext: 0 };

  const clamped = Math.max(0, Math.min(span, xp - prevCap));
  const progress = (clamped / span) * 100;
  const xpToNext = Math.max(0, currCap - xp);
  return { progress, xpToNext };
}

export function DashboardGarden({
  theme: fallbackTheme,
}: {
  theme: "day" | "night";
}) {
  const { data: me } = useMe();
  const theme = (me?.theme ?? fallbackTheme) as "day" | "night";
  const isDark = theme === "night";

  const { data: habits = [], isLoading, isError } = useHabits();
  const water = useWaterHabit();

  const isGamified = (me?.experimentVariant ?? "gamified") === "gamified";

  const [showModal, setShowModal] = useState(false);
  const [addHover, setAddHover] = useState(false);

  // hodnoty z /me
  const xp = me?.xp ?? 0;
  const level = me?.level ?? 1;
  const globalStreak = me?.currentStreak ?? 0;
  const { progress, xpToNext } = levelProgress(xp, level);

  // level-up detekce + scroll
  const prevLevelRef = useRef(level);
  const [leveledUp, setLeveledUp] = useState(false);
  const xpCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (level > prevLevelRef.current) {
      setLeveledUp(true);

      // scroll k XP panelu
      xpCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      prevLevelRef.current = level;
      const t = setTimeout(() => setLeveledUp(false), 1100);
      return () => clearTimeout(t);
    }
    prevLevelRef.current = level;
  }, [level]);

  if (isLoading) {
    return <div className="p-6">{isDark ? "Loading…" : "Loading…"}</div>;
  }
  if (isError) {
    return <div className="p-6 text-red-600">Failed to load habits.</div>;
  }

  const today = new Date();
  const canWater = (
    frequency: "Daily" | "Weekly",
    lastCompletedAt?: string | Date | null
  ) => {
    if (!lastCompletedAt) return true;
    const last = new Date(lastCompletedAt);

    if (frequency === "Daily") {
      return (
        last.getUTCFullYear() !== today.getUTCFullYear() ||
        last.getUTCMonth() !== today.getUTCMonth() ||
        last.getUTCDate() !== today.getUTCDate()
      );
    }

    const currentWeek = Math.ceil(
      (today.getUTCDate() - today.getUTCDay() + 1) / 7
    );
    const lastWeek = Math.ceil(
      (last.getUTCDate() - last.getUTCDay() + 1) / 7
    );
    return (
      currentWeek !== lastWeek ||
      today.getUTCMonth() !== last.getUTCMonth() ||
      today.getUTCFullYear() !== last.getUTCFullYear()
    );
  };

  const stageFromStreak = (
    s = 0
  ): "seed" | "sprout" | "flower" | "tree" =>
    s >= 30 ? "tree" : s >= 14 ? "flower" : s >= 7 ? "sprout" : "seed";

  const handleAddClick = () => {
    setShowModal(true);
  };

  return (
    <div className="space-y-8">
      {/* XP Progress a Streak jen pro gamifikovanou variantu */}
      {isGamified && (
        <div
          ref={xpCardRef}
          className={`relative overflow-hidden ${
            isDark ? "bg-slate-800 border-slate-700" : "bg-white border-green-100"
          } rounded-2xl p-6 shadow-md border`}
        >
          {/* 💥 Level-up burst aura */}
          <AnimatePresence>
            {leveledUp && (
              <motion.div
                className="absolute inset-0 pointer-events-none flex items-center justify-center z-0"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1.1 }}
                exit={{ opacity: 0, scale: 1.4 }}
                transition={{ duration: 0.8 }}
              >
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-yellow-300/40 via-amber-200/25 to-transparent blur-3xl" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ✨ Sparkles při level-up */}
          <AnimatePresence>
            {leveledUp && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="pointer-events-none z-10"
              >
                <motion.span
                  className="absolute top-4 right-8 text-yellow-300 text-xl"
                  initial={{ scale: 0, rotate: -20, opacity: 0 }}
                  animate={{ scale: 1.2, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  ✨
                </motion.span>
                <motion.span
                  className="absolute bottom-5 left-10 text-emerald-200 text-xl"
                  initial={{ scale: 0, rotate: 20, opacity: 0 }}
                  animate={{ scale: 1.1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  ✨
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-6 relative z-20">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                  XP Progress
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={isDark ? "text-white" : "text-gray-900"}>
                    Level {level}
                  </span>
                  <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                    {progress.toFixed(0)}%
                  </span>
                </div>

                {/* custom XP progress bar */}
                <div
                  className={`h-3 rounded-full overflow-hidden ${
                    isDark ? "bg-slate-700" : "bg-gray-200"
                  }`}
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-400 via-green-500 to-lime-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6 }}
                    key={level + "-" + Math.round(progress)}
                  />
                </div>

                <div
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {xpToNext} XP to next
                </div>
              </div>
            </div>

            <div>
              <p
                className={`mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Current Streak
              </p>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-5xl ${
                    isDark ? "text-white" : "text-green-600"
                  }`}
                >
                  {globalStreak}
                </span>
                <span
                  className={
                    isDark ? "text-gray-400" : "text-gray-500"
                  }
                >
                  days 🔥
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={isDark ? "text-white" : "text-gray-900"}>
            Your Garden
          </h2>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            Nurture your habits and watch them grow
          </p>
        </div>

        {/* Add Habit button se sparkle efektem na HOVER */}
        <motion.div
          className="relative"
          onMouseEnter={() => setAddHover(true)}
          onMouseLeave={() => setAddHover(false)}
        >
          <Button
            onClick={handleAddClick}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full shadow-md relative z-20"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Habit
          </Button>

          <AnimatePresence>
            {addHover && (
              <motion.div
                className="absolute inset-0 pointer-events-none z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* horní pravý třpyt */}
                <motion.span
                  className="absolute -top-2 right-1 text-yellow-300 text-lg"
                  initial={{ scale: 0, rotate: -20, opacity: 0 }}
                  animate={{ scale: 1.1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ✨
                </motion.span>
                {/* levý dolní třpyt */}
                <motion.span
                  className="absolute -bottom-2 left-3 text-emerald-200 text-lg"
                  initial={{ scale: 0, rotate: 20, opacity: 0 }}
                  animate={{ scale: 1.1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                >
                  ✨
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Full Garden View – pouze gamified */}
      {isGamified &&
        (() => {
          const habitsForGarden = (habits ?? []).map((h) => ({
            id: h._id,
            name: h.title,
            stage: stageFromStreak(h.streak ?? 0),
            streak: h.streak ?? 0,
          }));
          return <FullGardenView habits={habitsForGarden} theme={theme} />;
        })()}

      {/* Cards */}
      {habits.length === 0 ? (
        <div
          className={`${
            isDark ? "text-gray-400" : "text-gray-600"
          } text-center py-12`}
        >
          Your garden is empty. Add your first habit!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((h) => {
            const streak = h.streak ?? 0;
            const allowed = canWater(h.frequency, h.lastCompletedAt);
            return (
              <PlantCard
                key={h._id}
                habitName={h.title}
                frequency={h.frequency}
                streak={streak}
                theme={theme}
                disabled={!allowed}
                disabledLabel={
                  allowed
                    ? undefined
                    : h.frequency === "Daily"
                    ? "Done today"
                    : "Done this week"
                }
                onWater={() => allowed && water.mutate(h._id)}
              />
            );
          })}
        </div>
      )}

      <AddHabitModal
        open={showModal}
        onClose={() => setShowModal(false)}
        theme={theme}
      />
    </div>
  );
}
