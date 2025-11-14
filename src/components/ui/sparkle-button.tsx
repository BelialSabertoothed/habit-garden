import { useState } from "react";
import { Plus } from "lucide-react";
import {
  motion,
  AnimatePresence,
  type HTMLMotionProps,
} from "framer-motion";

type SparkleButtonProps = HTMLMotionProps<"button"> & {
  label: string;
  isDark?: boolean;
};

/** pastelky pro oba módy */
const COLORS_LIGHT = [
  "#22c55e",
  "#0ea5e9",
  "#a855f7",
  "#f97316",
  "#e11d48",
  "#14b8a6",
];

const COLORS_DARK = [
  "#bbf7d0",
  "#7dd3fc",
  "#c4b5fd",
  "#fed7aa",
  "#f9a8d4",
  "#a5f3fc",
];

/**
 * Jednoduchý pseudo-random, deterministický podle indexu,
 * aby burst při každém re-renderu nevypadal úplně jinak.
 */
function pr(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x); // 0–1
}

export function SparkleButton({
  label,
  isDark,
  onClick,
  className = "",
  ...rest
}: SparkleButtonProps) {
  const [burst, setBurst] = useState(0);
  const palette = isDark ? COLORS_DARK : COLORS_LIGHT;

  // jak daleko od středu začínají a kam letí
  const INNER_RADIUS = 28; // „koruna“ kolem buttonu
  const OUTER_RADIUS = 70; // jak daleko vyletí

  return (
    <motion.button
      {...rest}
      onClick={(e) => {
        setBurst((b) => b + 1);
        onClick?.(e);
      }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`
        relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full
        bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium
        shadow-md hover:shadow-lg
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
        overflow-visible
        ${className}
      `}
    >
      {/* obsah tlačítka nad efektem */}
      <span className="relative z-20 flex items-center gap-2">
        <Plus className="w-4 h-4" />
        {label}
      </span>

      {/* 🌈 Chaotic pastel triangle burst kolem tlačítka */}
      <AnimatePresence>
        <motion.div
          key={burst}
          className="pointer-events-none absolute top-1/2 left-1/2 z-10"
          style={{
            transform: "translate(-50%, -50%)",
            width: 0,
            height: 0,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          {palette.map((c, i) => {
            const count = palette.length;

            // základní úhel + jitter (chaos)
            const baseAngle = (i / count) * Math.PI * 2;
            const jitter = (pr(i + 1.2) - 0.5) * 0.9; // -0.45 až +0.45 rad
            const angle = baseAngle + jitter;

            // start v „koruně“ kolem tlačítka
            const r0 =
              INNER_RADIUS + pr(i + 2.3) * 10; // 28–38 px od středu
            // cíl o něco dál ven
            const r1 = OUTER_RADIUS + pr(i + 3.7) * 18; // cca 70–88 px

            const startX = Math.cos(angle) * r0;
            const startY = Math.sin(angle) * r0;
            const targetX = Math.cos(angle) * r1;
            const targetY = Math.sin(angle) * r1;

            const size = 10 + pr(i + 4.5) * 8; // různé velikosti
            const baseRot = pr(i + 5.1) * 360;

            const dur = 0.5 + pr(i + 6.2) * 0.4; // 0.5–0.9s
            const delay = pr(i + 7.3) * 0.08; // jemné posuny

            return (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: c,
                  clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                  filter: `drop-shadow(0 0 6px ${c})`,
                  mixBlendMode: "screen",
                }}
                initial={{
                  x: startX,
                  y: startY,
                  scale: 0.4,
                  opacity: 0,
                  rotate: baseRot - 40,
                }}
                animate={{
                  x: targetX,
                  y: targetY,
                  scale: [0.4, 1.2, 0.6],
                  opacity: [0, 1, 0],
                  rotate: baseRot + 60,
                }}
                transition={{
                  duration: dur,
                  delay,
                  ease: "easeOut",
                }}
              />
            );
          })}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}