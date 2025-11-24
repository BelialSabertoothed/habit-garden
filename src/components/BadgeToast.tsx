import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { BADGES, type BadgeId } from "./badges/config";
import { useTranslation } from "react-i18next";

type BadgeToastProps = {
  badgeId: BadgeId;
  theme: "day" | "night";
  visible: boolean;
};

export function BadgeToast({ badgeId, theme, visible }: BadgeToastProps) {
  const isDark = theme === "night";
  const cfg = BADGES[badgeId];
  const { t } = useTranslation();

  const cfgAny = cfg as any;

  const name =
    (cfgAny?.nameKey && t(cfgAny.nameKey)) ||
    cfgAny?.name ||
    t("profile.badgeToast.defaultName");

  const description =
    (cfgAny?.descriptionKey && t(cfgAny.descriptionKey)) ||
    cfgAny?.description ||
    t("profile.badgeToast.defaultDescription");

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="pointer-events-auto"
        >
          <div
            className={`
              relative overflow-hidden rounded-2xl shadow-2xl border
              max-w-sm w-[min(100vw-1.5rem,380px)] px-4 py-3 sm:px-5 sm:py-4
              ${
                isDark
                  ? "bg-slate-900/95 border-emerald-500/50"
                  : "bg-white/95 border-emerald-400/70"
              }
            `}
          >
            {/* Glow + gradient background accents */}
            <div className="pointer-events-none absolute inset-0">
              <div
                className={`
                  absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-50
                  ${isDark ? "bg-emerald-500/40" : "bg-emerald-300/50"}
                `}
              />
              <div
                className={`
                  absolute -bottom-8 -left-8 w-28 h-28 rounded-full blur-3xl opacity-40
                  ${isDark ? "bg-teal-500/30" : "bg-lime-300/50"}
                `}
              />
            </div>

            <div className="relative flex gap-3 sm:gap-4 items-center">
              {/* Ikona / medaile */}
              <div
                className={`
                  flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2
                  flex items-center justify-center shadow-md
                  bg-gradient-to-br
                  ${
                    isDark
                      ? "from-emerald-500 to-teal-400 border-emerald-300/80"
                      : "from-emerald-400 to-lime-400 border-emerald-500/80"
                  }
                `}
              >
                <motion.span
                  initial={{ scale: 0.6, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 14 }}
                  className="text-2xl"
                >
                  {/* můžeš si sem dát klidně vlastní emoji podle badgeId */}
                  🌟
                </motion.span>
              </div>

              {/* Texty */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Sparkles
                    className={`w-4 h-4 ${
                      isDark ? "text-emerald-300" : "text-emerald-600"
                    }`}
                  />
                  <p
                    className={`text-xs uppercase tracking-wide font-semibold ${
                      isDark ? "text-emerald-200" : "text-emerald-700"
                    }`}
                  >
                    {t("profile.badgeToast.label")}
                  </p>
                </div>

                <p
                  className={`text-sm sm:text-base font-semibold truncate ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {name}
                </p>

                <p
                  className={`mt-0.5 text-xs sm:text-sm leading-snug ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {description}
                </p>

                <p
                  className={`mt-1.5 text-[11px] sm:text-xs ${
                    isDark ? "text-emerald-200/90" : "text-emerald-700"
                  }`}
                >
                  {t("profile.badgeToast.checkPrefix")}{" "}
                  <span className="font-semibold">Profile → Badges</span>{" "}
                  {t("profile.badgeToast.checkSuffix")}
                </p>
              </div>
            </div>

            {/* Malé třpytky v rohu */}
            <motion.div
              className="pointer-events-none absolute -top-1 right-3 text-xs"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <span
                className={isDark ? "text-emerald-200" : "text-emerald-600"}
              >
                ✨
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
