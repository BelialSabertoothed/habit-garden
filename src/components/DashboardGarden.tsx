import { useState, useMemo, useEffect } from "react";
import { Plus, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { FullGardenView } from "./FullGardenView";
import { PlantCard } from "./PlantCard";
import { AddHabitModal } from "./AddHabitModal";
import { useHabits, useWaterHabit } from "../hooks/useHabits";
import { useMe } from "../hooks/useAuth";

export function DashboardGarden({ theme: fallbackTheme }: { theme: "day" | "night" }) {
  const { data: me } = useMe();
  const theme = (me?.theme ?? fallbackTheme) as "day" | "night";
  const isDark = theme === "night";

  // 🧩 Přidáno: logika pro variantu experimentu
  const [isGamified, setIsGamified] = useState<boolean | null>(null);

  useEffect(() => {
    if (me?.experimentVariant) {
      setIsGamified(me.experimentVariant === "gamified");
    } else {
      // pokud uživatel variantu ještě nemá, vyber náhodně (50/50)
      const randomVariant = Math.random() < 0.5 ? "gamified" : "control";
      setIsGamified(randomVariant === "gamified");
      // volitelně: můžeš odeslat PATCH na backend a uložit variantu
      // fetch(`/api/users/variant`, { method: "PATCH", body: JSON.stringify({ variant: randomVariant }) });
    }
  }, [me]);

  const { data: habits = [], isLoading, isError } = useHabits();
  const water = useWaterHabit();

  // pomocné funkce
  const rewardFor = (freq: "Daily" | "Weekly") => (freq === "Daily" ? 10 : 20);
  const stageFromStreak = (s = 0): "seed" | "sprout" | "flower" | "tree" =>
    s >= 30 ? "tree" : s >= 14 ? "flower" : s >= 7 ? "sprout" : "seed";

  const totalStreak = useMemo(() => habits.reduce((a, h) => a + (h.streak ?? 0), 0), [habits]);
  const totalXP = useMemo(
    () => habits.reduce((sum, h) => sum + (h.streak ?? 0) * rewardFor(h.frequency), 0),
    [habits]
  );

  const level = Math.floor(1 + Math.sqrt(totalXP / 100));
  const xpToNextLevel = (level + 1) ** 2 * 100 - totalXP;
  const progress = Math.min(100, (totalXP / ((level + 1) ** 2 * 100)) * 100);

  const [showModal, setShowModal] = useState(false);

  if (isGamified === null) return null; // počkej na variantu
  if (isLoading) return <div className="p-6">{isDark ? "Načítám…" : "Načítám…"}</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load habits.</div>;

  const today = new Date();
  const canWater = (frequency: "Daily" | "Weekly", lastCompletedAt?: string | Date | null) => {
    if (!lastCompletedAt) return true;
    const last = new Date(lastCompletedAt);
    if (frequency === "Daily")
      return (
        last.getUTCFullYear() !== today.getUTCFullYear() ||
        last.getUTCMonth() !== today.getUTCMonth() ||
        last.getUTCDate() !== today.getUTCDate()
      );
    const currentWeek = Math.ceil((today.getUTCDate() - today.getUTCDay() + 1) / 7);
    const lastWeek = Math.ceil((last.getUTCDate() - last.getUTCDay() + 1) / 7);
    return currentWeek !== lastWeek || today.getUTCMonth() !== last.getUTCMonth();
  };

  return (
    <div className="space-y-8">
      {/* XP Progress a Streak jen pro gamifikovanou variantu */}
      {isGamified && (
        <div
          className={`${
            isDark ? "bg-slate-800 border-slate-700" : "bg-white border-green-100"
          } rounded-2xl p-6 shadow-md border`}
        >
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className={isDark ? "text-gray-300" : "text-gray-600"}>XP Progress</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={isDark ? "text-white" : "text-gray-900"}>Level {level}</span>
                  <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {xpToNextLevel} XP to next
                </div>
              </div>
            </div>
            <div>
              <p className={`mb-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>Current Streak</p>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-5xl ${isDark ? "text-white" : "text-green-600"}`}
                >
                  {totalStreak}
                </span>
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>total 🔥</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={isDark ? "text-white" : "text-gray-900"}>Your Garden</h2>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            Nurture your habits and watch them grow
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full shadow-md"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Habit
        </Button>
      </div>

      {/* Full Garden View – pouze gamified */}
      {isGamified && (() => {
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
                growthStage={stageFromStreak(streak)}
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

      <AddHabitModal open={showModal} onClose={() => setShowModal(false)} theme={theme} />
    </div>
  );
}
