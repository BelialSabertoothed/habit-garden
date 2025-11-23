import { useState, useEffect, useRef } from "react";
import { Zap, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FullGardenView } from "./FullGardenView";
import { PlantCard } from "./PlantCard";
import { AddHabitModal } from "./AddHabitModal";
import { useHabits, useWaterHabit } from "../hooks/useHabits";
import { useMe } from "../hooks/useAuth";
import { SparkleButton } from "./ui/sparkle-button";

/* stejné level křivce jako na BE */
const levelMaxXp = (lvl: number) => (lvl + 1) ** 2 * 100;

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

/* ---------- growth logic stejná jako v PlantCard ---------- */

type Stage = "seed" | "sprout" | "flower" | "tree";

function getGrowthStage(streak: number, freq: "Daily" | "Weekly"): Stage {
  if (freq === "Daily") {
    if (streak >= 14) return "tree";
    if (streak >= 7) return "flower";
    if (streak >= 3) return "sprout";
    return "seed";
  }
  // WEEKLY
  if (streak >= 6) return "tree";
  if (streak >= 4) return "flower";
  if (streak >= 2) return "sprout";
  return "seed";
}

/* ---------- typy pro filtry ---------- */

type CategoryFilter =
  | "All"
  | "Health"
  | "Eco"
  | "Productivity"
  | "Relationships"
  | "Creativity"
  | "Custom";
type StageFilter = "all" | Stage;
type StatusFilter = "all" | "waiting" | "done";

/* ---------- helpery pro daily/weekly vodu ---------- */

function dayKey(date: string | Date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function isoWeekKey(date: string | Date) {
  const d = new Date(date);
  const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

  let day = utc.getUTCDay();
  if (day === 0) day = 7; // neděle = 7

  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  return `${utc.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

const today = new Date();

const canWaterBackend = (
  frequency: "Daily" | "Weekly",
  lastCompletedAt?: string | Date | null
) => {
  if (!lastCompletedAt) return true;
  const last = new Date(lastCompletedAt);

  if (frequency === "Daily") {
    return dayKey(last) !== dayKey(today);
  }
  return isoWeekKey(last) !== isoWeekKey(today);
};

function getMsUntilNext20() {
  const now = new Date();
  const target = new Date();

  target.setHours(20, 0, 0, 0); // dnešní 20:00

  if (target <= now) {
    // už po 20:00 → bereme zítřek
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - now.getTime();
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

  // FILTRY
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  // krátkodobě držíme id zalitých habitů, aby se neposunuly dřív než doběhne animace
  const [recentlyWatered, setRecentlyWatered] = useState<
    Record<string, { ts: number; lockStreak: number }>
  >({});

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
        if (!me?.notificationsEnabled) return;

    // Notifications nemusí existovat (starý browser)
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }


    // pokud user explicitně zakázal notifikace, nedělej nic
    if (Notification.permission === "denied") {
      return;
    }

    let cancelled = false;
    let timeoutId: number | undefined;

    const scheduleNext = () => {
      if (cancelled) return;
      const ms = getMsUntilNext20();
      timeoutId = window.setTimeout(async () => {
        if (cancelled) return;

        // jistota – když je permission default, můžeme se zkusit zeptat
        if (Notification.permission === "default") {
          const perm = await Notification.requestPermission();
          if (perm !== "granted") {
            // user nechce → už ho neotravujeme
            return;
          }
        }

        if (Notification.permission !== "granted") {
          return;
        }

        // máme habits z React Query
        const hasWaterable = (habits ?? []).some((h) =>
          canWaterBackend(h.frequency, h.lastCompletedAt)
        );

        if (hasWaterable) {
          const n = new Notification("Time to water your garden 🌱", {
            body: "You still have habits waiting today.",
            icon: "/icons/icon-192.png",
            badge: "/icons/icon-192.png",
          });

          n.onclick = () => {
            // fokus na okno + přepnutí na Garden (kdybys měla routování)
            window.focus();
            // můžeš si sem případně dát window.location.hash = "#garden";
          };
        }

        // naplánuj další den
        scheduleNext();
      }, ms);
    };

    scheduleNext();

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [habits, me?.notificationsEnabled]);

  useEffect(() => {
    if (level > prevLevelRef.current) {
      setLeveledUp(true);

      // scrollujeme jen když je user blízko vrchu, jinak neskáčeme
      const scrollY =
        window.scrollY ??
        window.pageYOffset ??
        document.documentElement.scrollTop ??
        0;
      if (scrollY < 160) {
        xpCardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

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

  const categories: CategoryFilter[] = [
    "All",
    "Health",
    "Eco",
    "Productivity",
    "Relationships",
    "Creativity",
    "Custom",
  ];

  // helper MUSÍ být nadefinovaný před použitím v sortu
  const getSortStreak = (
    habit: (typeof habits)[number],
    map: typeof recentlyWatered
  ) => {
    const lock = map[habit._id];
    if (lock && typeof lock.lockStreak === "number") {
      return lock.lockStreak;
    }
    return habit.streak ?? 0;
  };

  /* ---------- aplikace filtrů + řazení ---------- */

  const filteredAndSortedHabits = habits
    .filter((h) => {
      const streak = h.streak ?? 0;
      const stage = getGrowthStage(streak, h.frequency);
      const waitingRaw = canWaterBackend(h.frequency, h.lastCompletedAt);
      const waiting = waitingRaw || !!recentlyWatered[h._id];

      // kategorie
      if (categoryFilter !== "All" && h.category !== categoryFilter)
        return false;

      // stage
      if (stageFilter !== "all" && stage !== stageFilter) return false;

      // status
      if (statusFilter === "waiting" && !waiting) return false;
      if (statusFilter === "done" && waiting) return false;

      return true;
    })
    .sort((a, b) => {
      const aWaiting =
        canWaterBackend(a.frequency, a.lastCompletedAt) ||
        !!recentlyWatered[a._id];
      const bWaiting =
        canWaterBackend(b.frequency, b.lastCompletedAt) ||
        !!recentlyWatered[b._id];

      // čekající nahoře
      if (aWaiting !== bWaiting) return aWaiting ? -1 : 1;

      // během animace používáme zamražený streak,
      // jinak aktuální => karta se nehýbe, dokud neskončí animace
      const aStreak = getSortStreak(a, recentlyWatered);
      const bStreak = getSortStreak(b, recentlyWatered);

      return bStreak - aStreak;
    });

  return (
    <div className="space-y-8">
      {/* XP Progress a Streak jen pro gamifikovanou variantu */}
      {isGamified && (
        <div
          ref={xpCardRef}
          className={`relative overflow-hidden ${
            isDark
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-green-100"
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
                className={`mb-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}
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
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                  days 🔥
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className={isDark ? "text-white" : "text-gray-900"}>
            Your Garden
          </h2>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            Nurture your habits and watch them grow
          </p>
        </div>
        <SparkleButton
          label="Add New Habit"
          isDark={isDark}
          onClick={() => setShowModal(true)}
        />
      </div>

      {/* Full Garden View – pouze gamified */}
      {isGamified &&
        (() => {
          const habitsForGarden = (habits ?? []).map((h) => ({
            id: h._id,
            name: h.title,
            frequency: h.frequency,
            currentStreak: h.streak ?? 0,
            bestStreak: (h as any).bestStreak ?? h.streak ?? 0,
          }));

          return <FullGardenView habits={habitsForGarden} theme={theme} />;
        })()}

      {/* Toggle pro filtry */}
      {habits.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <span
            className={`text-xs uppercase tracking-wide ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Filters
          </span>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={`ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-colors ${
              showFilters
                ? "bg-emerald-500 text-white border-emerald-500"
                : isDark
                ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? "Hide filters" : "Show filters"}
          </button>
        </div>
      )}

      {/* Filtrační panel (collapsible) */}
      <AnimatePresence initial={false}>
        {showFilters && habits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="origin-top"
          >
            <div
              className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mt-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {/* Kategorie */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs uppercase tracking-wide opacity-70">
                  Category:
                </span>
                {categories.map((cat) => {
                  const active = categoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-full text-xs md:text-sm border transition-colors ${
                        active
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : isDark
                          ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                          : "border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Stage + Status */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* Stage */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs uppercase tracking-wide opacity-70">
                    Stage:
                  </span>
                  {(
                    [
                      { id: "all", label: "All" },
                      { id: "seed", label: "Seed" },
                      { id: "sprout", label: "Sprout" },
                      { id: "flower", label: "Flower" },
                      { id: "tree", label: "Tree" },
                    ] as { id: StageFilter; label: string }[]
                  ).map((s) => {
                    const active = stageFilter === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setStageFilter(s.id)}
                        className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                          active
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : isDark
                            ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                            : "border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>

                {/* Status */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs uppercase tracking-wide opacity-70">
                    Status:
                  </span>
                  {(
                    [
                      { id: "all", label: "All" },
                      { id: "waiting", label: "Waiting" },
                      { id: "done", label: "Done" },
                    ] as { id: StatusFilter; label: string }[]
                  ).map((s) => {
                    const active = statusFilter === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setStatusFilter(s.id)}
                        className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                          active
                            ? "bg-blue-500 text-white border-blue-500"
                            : isDark
                            ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                            : "border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards */}
      {filteredAndSortedHabits.length === 0 ? (
        <div
          className={`${
            isDark ? "text-gray-400" : "text-gray-600"
          } text-center py-12`}
        >
          No habits match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedHabits.map((h) => {
            const streak = h.streak ?? 0;
            const backendAllowed = canWaterBackend(
              h.frequency,
              h.lastCompletedAt
            );

            const isWateringThis = water.isPending && water.variables === h._id;

            const disabled = !backendAllowed || isWateringThis;

            const disabledLabel = !backendAllowed
              ? h.frequency === "Daily"
                ? "Done today"
                : "Done this week"
              : isWateringThis
              ? "Updating…"
              : undefined;

            return (
              <PlantCard
                key={h._id}
                habitName={h.title}
                frequency={h.frequency}
                streak={streak}
                bestStreak={h.bestStreak}
                theme={theme}
                disabled={disabled}
                disabledLabel={disabledLabel}
                onWater={() => {
                  const id = h._id;
                  if (!backendAllowed || isWateringThis) {
                    return Promise.resolve();
                  }

                  const ts = Date.now();
                  const lockStreak = streak; // původní hodnota před zalitím

                  setRecentlyWatered((prev) => ({
                    ...prev,
                    [id]: { ts, lockStreak },
                  }));

                  setTimeout(() => {
                    setRecentlyWatered((prev) => {
                      const current = prev[id];
                      // pokud mezitím proběhlo další zalití, necháme novější zámek
                      if (!current || current.ts !== ts) return prev;
                      const copy: typeof prev = { ...prev };
                      delete copy[id];
                      return copy;
                    });
                  }, 1200);

                  return water.mutateAsync(id);
                }}
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
