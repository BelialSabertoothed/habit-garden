import { Droplet, Sprout, Leaf, Flower2, TreeDeciduous } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

/* -------------------------------- Logic -------------------------------- */

type Stage = "seed" | "sprout" | "flower" | "tree";

function getGrowthStage(streak: number, freq: "Daily" | "Weekly"): Stage {
  if (freq === "Daily") {
    if (streak >= 14) return "tree";
    if (streak >= 7) return "flower";
    if (streak >= 3) return "sprout";
    return "seed";
  }
  if (streak >= 6) return "tree";
  if (streak >= 4) return "flower";
  if (streak >= 2) return "sprout";
  return "seed";
}

function getGrowthProgress(streak: number, freq: "Daily" | "Weekly") {
  if (freq === "Daily") {
    if (streak < 3) return (streak / 3) * 100;       // seed → sprout
    if (streak < 7) return ((streak - 3) / 4) * 100; // sprout → flower
    if (streak < 14) return ((streak - 7) / 7) * 100;// flower → tree
    return 100;
  }

  if (streak < 2) return (streak / 2) * 100;
  if (streak < 4) return ((streak - 2) / 2) * 100;
  if (streak < 6) return ((streak - 4) / 2) * 100;
  return 100;
}

/* -------------------------------- UI Config -------------------------------- */

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

/* -------------------------------- Component -------------------------------- */

interface PlantCardProps {
  habitName: string;
  frequency: "Daily" | "Weekly";
  streak: number;
  onWater: () => Promise<any> | void;
  theme: "day" | "night";
  disabled?: boolean;
  disabledLabel?: string;
}

export function PlantCard({
  habitName,
  frequency,
  streak,
  onWater,
  theme,
  disabled,
  disabledLabel,
}: PlantCardProps) {
  const isDark = theme === "night";

  const stage = getGrowthStage(streak, frequency);
  const progress = getGrowthProgress(streak, frequency);
  const config = stageConfig[stage];
  const Icon = config.icon;

  /* ---------------- WATERING ANIMATION ---------------- */
  const [watering, setWatering] = useState(false);

  const handleWater = async () => {
    if (disabled) return;
    setWatering(true);
    await onWater?.();
    setTimeout(() => setWatering(false), 900);
  };

  /* ---------------- EVOLUTION AURA ---------------- */
  const prevStage = useRef(stage);
  const [evolving, setEvolving] = useState(false);

  useEffect(() => {
    if (prevStage.current !== stage) {
      setEvolving(true);
      prevStage.current = stage;

      setTimeout(() => setEvolving(false), 1200);
    }
  }, [stage]);

  return (
    <div
      className={`${
        isDark ? "bg-slate-800 border-slate-700" : "bg-white border-green-100"
      } rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border relative overflow-hidden`}
    >

      {/* ✨ Stage-up aura */}
      <AnimatePresence>
        {evolving && (
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

      {/* ✨ Sparkles */}
      <AnimatePresence>
        {evolving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-3 left-6 text-yellow-300 text-xl animate-ping">✨</div>
            <div className="absolute bottom-4 right-8 text-green-200 text-xl animate-ping">✨</div>
            <div className="absolute top-10 right-10 text-emerald-200 text-xl animate-ping">✨</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💧 Water droplets animation */}
      <AnimatePresence>
        {watering && (
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

        {/* 🌱 Plant Icon with evolution pop */}
        <motion.div
          animate={watering || evolving ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center"
        >
          <div
            className={`bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center shadow-lg`}
            style={{
              width: config.size,
              height: config.size,
              transition: "all 0.3s",
            }}
          >
            <Icon className="text-white" size={config.size * 0.45} />
          </div>
        </motion.div>

        {/* 📊 Progress Bar with stage-based gradient */}
        <div className="w-full">
          <div className={`h-2 rounded-full overflow-hidden mb-2 ${isDark ? "bg-slate-700" : "bg-gray-200"}`}>
            <motion.div
              className={`h-full bg-gradient-to-r ${config.progressColor} rounded-full`}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>

          <p className={`text-center font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
            {habitName}
          </p>
          <p className={`text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            🔥 {streak} {frequency === "Daily" ? "days" : "weeks"} streak
          </p>
        </div>

        {/* 💧 Water Button */}
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
          <Droplet className="w-4 h-4 mr-2" />
          {disabled ? disabledLabel ?? "Completed" : "Water Plant"}
        </Button>
      </div>
    </div>
  );
}
