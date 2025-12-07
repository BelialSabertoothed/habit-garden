import { Droplet, Sprout, Leaf, Flower2, TreeDeciduous, Heart, Briefcase, Users, Palette } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getStageAndProgress } from "../lib/growth";
import { SUGGESTED_HABITS_BY_CATEGORY } from "../data/suggestedHabits";

/* ---------------- UI Config - Gamified ---------------- */

const stageConfig = {
  seed: {
    icon: Sprout,
    color: "from-amber-200 to-amber-300",
    progressColor: "from-yellow-300 to-amber-400",
    size: 60,
  },
  sprout: {
    icon: Leaf,
    color: "from-green-300 to-green-500",
    progressColor: "from-green-400 to-emerald-500",
    size: 60,
  },
  flower: {
    icon: Flower2,
    color: "from-pink-300 to-rose-400",
    progressColor: "from-pink-400 to-rose-500",
    size: 60,
  },
  tree: {
    icon: TreeDeciduous,
    color: "from-emerald-400 to-green-600",
    progressColor: "from-emerald-500 to-green-600",
    size: 60,
  },
} as const;

/* ---------------- UI Config - Control (Category Icons) ---------------- */

const iconMap: Record<string, any> = {
  heart: Heart,
  leaf: Leaf,
  briefcase: Briefcase,
  users: Users,
  palette: Palette,
};

const SUGGESTION_TITLE_MAP: Record<string, string> = {};
Object.values(SUGGESTED_HABITS_BY_CATEGORY)
  .flat()
  .forEach((h) => {
    SUGGESTION_TITLE_MAP[h.title] = h.titleKey;
  });

/* ---------------- Component ---------------- */

interface PlantCardProps {
  habitName: string;
  frequency: "Daily" | "Weekly";
  streak: number;
  bestStreak?: number;
  onWater: () => Promise<any> | void;
  theme: "day" | "night";
  disabled?: boolean;
  disabledLabel?: string;
  isGamified?: boolean;
  iconId?: string; 
}

export function PlantCard({
  habitName,
  frequency,
  streak,
  bestStreak,
  onWater,
  theme,
  disabled,
  disabledLabel,
  isGamified = true, 
  iconId = "leaf",
}: PlantCardProps) {
  const isDark = theme === "night";
  const { t } = useTranslation();

  // --- Logika pro GAMIFIED (fáze růstu) ---
  const { stage, progress } = getStageAndProgress(
    frequency,
    streak,
    bestStreak ?? 0
  );
  
  // Vybereme ikonu a barvy
  let IconComponent: any;
  let bgGradient = "";
  let progressColor = "";

  if (isGamified) {
    const config = stageConfig[stage];
    IconComponent = config.icon;
    bgGradient = config.color;
    progressColor = config.progressColor;
  } else {
    IconComponent = iconMap[iconId] ?? Leaf;
    bgGradient = isDark ? "from-slate-700 to-slate-600" : "from-gray-100 to-gray-200";
    progressColor = "from-emerald-400 to-emerald-600";
  }

  /* ---------------- WATERING ANIMATION ---------------- */
  const [watering, setWatering] = useState(false);

  const handleWater = async () => {
    if (disabled) return;
    
    if (isGamified) {
      setWatering(true);
    }
    
    await onWater?.();
    
    if (isGamified) {
      setTimeout(() => setWatering(false), 900);
    }
  };

  /* ---------------- EVOLUTION AURA (Jen gamified) ---------------- */
  const prevStage = useRef(stage);
  const [evolving, setEvolving] = useState(false);

  const visualProgress = stage === "tree" ? progress : Math.min(progress, 85);

  useEffect(() => {
    if (!isGamified) return; 
    if (prevStage.current !== stage) {
      setEvolving(true);
      prevStage.current = stage;
      setTimeout(() => setEvolving(false), 1200);
    }
  }, [stage, isGamified]);

  const streakText =
    frequency === "Daily"
      ? t("dashboard.plantCard.streak.daily", { count: streak })
      : t("dashboard.plantCard.streak.weekly", { count: streak });

  const translationKey = SUGGESTION_TITLE_MAP[habitName];
  const displayName = translationKey ? t(translationKey) : habitName;

  return (
    <div
      className={`${
        isDark ? "bg-slate-800 border-slate-700" : "bg-white border-green-100"
      } rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border relative overflow-hidden`}
    >
      {/* ✨ Stage-up aura (Jen Gamified) */}
      <AnimatePresence>
        {isGamified && evolving && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 0.9, scale: 1.4 }}
            exit={{ opacity: 0, scale: 1.8 }}
            transition={{ duration: 1.1 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-200/25 via-green-200/25 to-teal-200/25 blur-xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✨ Sparkles (Jen Gamified) */}
      <AnimatePresence>
        {isGamified && evolving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-3 left-6 text-yellow-300 text-xl animate-ping">✨</div>
            <div className="absolute bottom-4 right-8 text-green-200 text-xl animate-ping">✨</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💧 Water droplets animation (Jen Gamified) */}
      <AnimatePresence>
        {isGamified && watering && (
          <motion.div
            className="absolute inset-0 pointer-events-none flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-cyan-300"
                initial={{ y: -10, opacity: 0, x: 0 }}
                animate={{
                  y: 90,
                  opacity: [0, 1, 0],
                  x: (i - 1.5) * 20,
                  scale: [0.8, 1.1],
                }}
                transition={{ duration: 0.9, delay: i * 0.1 }}
              >
                <Droplet className="w-5 h-5" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- CONTENT ---------------- */}
      <div className="flex flex-col items-center gap-4 relative z-10">
        {/* 🌱 Plant / Category icon */}
        <motion.div
          // Animace "pop" pouze pro gamifikovanou verzi
          animate={
            isGamified && (watering || evolving) ? { scale: [1, 1.15, 1] } : { scale: 1 }
          }
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center"
        >
          <div
            className={`bg-gradient-to-br ${bgGradient} rounded-full flex items-center justify-center shadow-lg`}
            style={{
              width: 60,
              height: 60,
            }}
          >
            <IconComponent 
              className={isGamified ? "text-white" : (isDark ? "text-gray-300" : "text-gray-600")} 
              size={isGamified ? 27 : 24} 
            />
          </div>
        </motion.div>

        {/* 📊 Content info */}
        <div className="w-full">
          {/* Progress bar zobrazíme jen v Gamified verzi, v Control to může působit rušivě/zbytečně, 
              pokud nechceme ukazovat "růst". Pokud chceme v Control ukázat "completed", stačí jen tlačítko.
              Pro tuto úpravu Progress bar v Control verzi skryjeme. */}
          {isGamified && (
            <div
              className={`h-2 rounded-full overflow-hidden mb-2 ${
                isDark ? "bg-slate-700" : "bg-gray-200"
              }`}
            >
              <motion.div
                className={`h-full bg-gradient-to-r ${progressColor} rounded-full`}
                animate={{ width: `${visualProgress}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          )}

          <p
            className={`text-center font-medium ${
              isDark ? "text-white" : "text-gray-900"
            } ${!isGamified ? "mb-1 text-lg" : ""}`}
          >
            {displayName}
          </p>

          {/* Streak text - JEN v Gamified */}
          {isGamified && (
            <p
              className={`text-center text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {streakText}
            </p>
          )}
        </div>

        {/* 💧 Water / Done Button */}
        <Button
          onClick={handleWater}
          disabled={disabled}
          className={`w-full rounded-full shadow-sm transition-all duration-200 ${
            disabled
              ? isDark
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white"
          }`}
        >
          {/* Ikonku kapky v Control verzi můžeme nechat nebo změnit na 'check' */}
          {isGamified ? <Droplet className="w-4 h-4 mr-2" /> : null}
          
          {disabled
            ? disabledLabel ?? t("dashboard.plantCard.button.completed")
            : t("dashboard.plantCard.button.water")}
        </Button>
      </div>
    </div>
  );
}