import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Award,
  Sun,
  Moon,
  Zap,
  Pencil,
  User as UserIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { BadgeIcon } from "./BadgeIcon";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useMe } from "../hooks/useAuth";
import { api } from "../lib/api";
import EditProfileModal from "./UpdateProfileModal";
import { useRewards } from "../hooks/useRewards";
import { BADGES, type BadgeId } from "./badges/config";

/* ---------- XP / level křivka – stejné jako na BE ---------- */

const levelMaxXp = (lvl: number) => ((lvl + 1) ** 2) * 100;

function levelProgress(xp: number, level: number) {
  const currCap = levelMaxXp(level);
  const prevCap = level > 1 ? levelMaxXp(level - 1) : 0;
  const span = currCap - prevCap || 1;

  const inLevel = Math.max(0, xp - prevCap);
  const progress = Math.min(100, (inLevel / span) * 100);
  return {
    progressPercent: progress,
    inLevel,
    span,
  };
}

export function ProfileRewards() {
  const [editOpen, setEditOpen] = useState(false);
  const { data: me, isLoading } = useMe();
  const { data: rewardsRaw } = useRewards();
  const qc = useQueryClient();

  if (isLoading || !me) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 border bg-white/70 dark:bg-slate-800/70 animate-pulse h-40" />
        <div className="rounded-2xl p-6 border bg-white/70 dark:bg-slate-800/70 animate-pulse h-28" />
        <div className="rounded-2xl p-6 border bg-white/70 dark:bg-slate-800/70 animate-pulse h-64" />
      </div>
    );
  }

  const theme = (me.theme ?? "day") as "day" | "night";
  const isDark = theme === "night";
  const currentVariant = (me.experimentVariant ?? "gamified") as
    | "gamified"
    | "control";
  const isGamified = currentVariant === "gamified";

  const level = me.level ?? 1;
  const totalXP = me.xp ?? 0;
  const { progressPercent, inLevel, span } = levelProgress(totalXP, level);

  /* ---------- Badges z BE rewards + configu ---------- */
  const rewards = Array.isArray(rewardsRaw)
    ? rewardsRaw
    : (rewardsRaw as any)?.items ?? [];

  const unlockedIds = new Set<BadgeId>(
    rewards
      .map((r: any) => r.badge as string | null | undefined)
      .filter((b): b is BadgeId => !!b) // stačí jen vyhodit null/undefined
  );

  const badges = (Object.entries(BADGES) as [
    BadgeId,
    (typeof BADGES)[BadgeId]
  ][]).map(([id, cfg]) => ({
    id,
    unlocked: unlockedIds.has(id),
    name: cfg.name,
    description: cfg.description,
    clue: cfg.clue,
  }));

  /* ---------- Actions ---------- */

  const handleThemeToggle = async (checked: boolean) => {
    const newTheme: "day" | "night" = checked ? "night" : "day";
    const prev = qc.getQueryData(["me"]);
    qc.setQueryData(["me"], { ...me, theme: newTheme });
    try {
      await api.post("profile/theme", { json: { theme: newTheme } });
      await qc.invalidateQueries({ queryKey: ["me"] });
    } catch {
      qc.setQueryData(["me"], prev);
    }
  };

  const onChangeVariant = async (next: "gamified" | "control") => {
    if (next === currentVariant) return;
    const prev = qc.getQueryData(["me"]);
    qc.setQueryData(["me"], { ...me, experimentVariant: next });
    try {
      await api.post("profile/experiment", { json: { variant: next } });
      await qc.invalidateQueries({ queryKey: ["me"] });
    } catch {
      qc.setQueryData(["me"], prev);
    }
  };

  /* ---------- UI ---------- */

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className={isDark ? "text-white" : "text-gray-900"}>
          {isGamified ? "Profile & Rewards" : "Profile"}
        </h2>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          {isGamified
            ? "Track your achievements and customize your experience"
            : "Customize your experience"}
        </p>
      </div>

      {/* Profile Card */}
      <div
        className={`relative ${
          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"
        } rounded-2xl p-6 shadow-md border`}
      >
        {/* Edit button */}
        <button
          onClick={() => setEditOpen(true)}
          className={`absolute top-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium transition-colors
            ${
              isDark
                ? "border-slate-600 text-slate-200 hover:bg-slate-700"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          aria-label="Edit profile"
          title="Edit profile"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6">
          {/* Avatar */}
          <motion.div
            className="w-20 h-20 rounded-full shadow-md flex items-center justify-center text-4xl bg-gradient-to-br from-green-400 to-emerald-500 text-white shrink-0 mx-auto sm:mx-0"
            whileHover={{ scale: 1.05, rotate: -2 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            {me.avatar ? (
              <span>{me.avatar}</span>
            ) : (
              <UserIcon className="w-10 h-10" />
            )}
          </motion.div>

          <div className="flex-1 text-center sm:text-left">
            <h3
              className={`mb-1 text-lg sm:text-xl ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {me.nickname ?? "Habit Gardener"}
            </h3>
            <p
              className={`mb-4 text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              } truncate`}
            >
              {me.email}
            </p>

            {/* Gamified metrics */}
            {isGamified && (
              <div className="space-y-3">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                  <div
                    className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-white text-sm shadow-sm ${
                      isDark
                        ? "bg-gradient-to-r from-green-600 to-emerald-700"
                        : "bg-gradient-to-r from-green-500 to-emerald-500"
                    }`}
                  >
                    Level {level}
                  </div>

                  <div className="flex items-center justify-center md:justify-start gap-2 text-sm">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span className={isDark ? "text-white" : "text-gray-900"}>
                      {totalXP} XP total
                    </span>
                  </div>

                  <div
                    className={`text-xs md:text-sm ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    🔥 Streak: {me.currentStreak ?? 0} (best{" "}
                    {me.longestStreak ?? 0})
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span
                      className={isDark ? "text-gray-300" : "text-gray-600"}
                    >
                      Progress to Level {level + 1}
                    </span>
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-500"}
                    >
                      {inLevel} / {span} XP
                    </span>
                  </div>
                  <div
                    className={`h-3 rounded-full overflow-hidden ${
                      isDark ? "bg-slate-700" : "bg-gray-200"
                    }`}
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-400 via-green-500 to-lime-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.6 }}
                      key={level + "-" + Math.round(progressPercent)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Theme Selector */}
      <div
        className={`${
          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"
        } rounded-2xl p-6 shadow-md border`}
      >
        <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
          Theme Preferences
        </h3>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Sun
              className={`w-5 h-5 ${
                isDark ? "text-gray-400" : "text-amber-500"
              }`}
            />
            <Label
              htmlFor="theme-switch"
              className={isDark ? "text-gray-300" : "text-gray-700"}
            >
              {theme === "day" ? "Day Mode" : "Night Mode"}
            </Label>
            <Moon
              className={`w-5 h-5 ${
                isDark ? "text-blue-400" : "text-gray-400"
              }`}
            />
          </div>

          <Switch
            id="theme-switch"
            checked={theme === "night"}
            onCheckedChange={handleThemeToggle}
          />
        </div>
      </div>

      {/* Badges Section – jen pro gamified */}
      {isGamified && (
        <div
          className={`${
            isDark
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-100"
          } rounded-2xl p-6 shadow-md border`}
        >
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-purple-500" />
            <h3 className={isDark ? "text-white" : "text-gray-900"}>
              Badges
            </h3>
            <span
              className={`ml-auto text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {badges.filter((b) => b.unlocked).length} of {badges.length}{" "}
              unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map((badge, idx) =>
              badge.unlocked ? (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -2, rotate: -1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative h-full min-h-[170px]"
                >
                  <BadgeIcon
                    type={badge.id}
                    unlocked
                    name={badge.name}
                    description={badge.description}
                    theme={theme}
                  />
                  <motion.span
                    className="pointer-events-none absolute -top-1 -right-1 text-[10px]"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15 + idx * 0.04 }}
                  >
                    ✨
                  </motion.span>
                </motion.div>
              ) : (
                <motion.div
                  key={badge.id}
                  className={`flex flex-col items-center text:center rounded-xl border px-3 py-4 h-full min-h-[170px] ${
                    isDark
                      ? "border-slate-700 bg-slate-900/40"
                      : "border-gray-200 bg-gray-50"
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                      isDark
                        ? "bg-slate-800 text-gray-300"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    <span className="text-xl">?</span>
                  </div>
                  <p
                    className={`font-medium text-sm mb-1 ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Hidden badge
                  </p>
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {badge.clue}
                  </p>
                </motion.div>
              )
            )}
          </div>
        </div>
      )}

      {/* Experiment Variant Selector */}
      <div
        className={`${
          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"
        } rounded-2xl p-6 shadow-md border`}
      >
        <h3 className={`mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
          Experiment Variant
        </h3>
        <p
          className={
            isDark ? "text-gray-400 mb-4" : "text-gray-600 mb-4"
          }
        >
          Switch between the gamified experience (XP, levels, badges) and the
          minimal experience (no gamification).
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onChangeVariant("gamified")}
            className={`px-4 py-2 rounded border text-sm transition-colors ${
              currentVariant === "gamified"
                ? "bg-emerald-600 text-white border-emerald-600"
                : isDark
                ? "border-slate-600 text-slate-200 hover:bg-slate-700"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Gamified
          </button>

          <button
            onClick={() => onChangeVariant("control")}
            className={`px-4 py-2 rounded border text-sm transition-colors ${
              currentVariant === "control"
                ? "bg-slate-900 text-white border-slate-900"
                : isDark
                ? "border-slate-600 text-slate-200 hover:bg-slate-700"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Control (No Gamification)
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={editOpen}
        onOpenChange={setEditOpen}
        theme={theme}
      />
    </div>
  );
}