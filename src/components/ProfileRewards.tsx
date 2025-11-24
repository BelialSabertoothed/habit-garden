import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Award, Sun, Moon, Zap, Pencil, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import { BadgeIcon } from "./BadgeIcon";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useMe } from "../hooks/useAuth";
import { api } from "../lib/api";
import EditProfileModal from "./UpdateProfileModal";
import { useRewards } from "../hooks/useRewards";
import { BADGES, type BadgeId } from "./badges/config";
import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import {
  enableNotificationsOnClient,
  disableNotificationsOnClient,
} from "../lib/notification";

/* ---------- XP / level křivka – stejné jako na BE ---------- */

const levelMaxXp = (lvl: number) => (lvl + 1) ** 2 * 100;

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
  const { t } = useTranslation();

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

  interface RewardItem {
    badge?: BadgeId | null;
    [key: string]: unknown;
  }
  const typedRewards = rewards as RewardItem[];

  const unlockedIds = new Set<BadgeId>(
    typedRewards
      .map((r) => r.badge)
      .filter((b): b is BadgeId => !!b)
  );

  const badges = (
    Object.entries(BADGES) as [BadgeId, (typeof BADGES)[BadgeId]][]
  ).map(([id, cfg]) => ({
    id,
    unlocked: unlockedIds.has(id),
    name: t(cfg.nameKey),
    description: t(cfg.descriptionKey),
    clue: cfg.clueKey ? t(cfg.clueKey) : undefined,
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

  const handleNotificationsToggle = async (checked: boolean) => {
    const prev = qc.getQueryData(["me"]);
    // optimistic update v UI
    qc.setQueryData(["me"], { ...me, notificationsEnabled: checked });

    try {
      if (checked) {
        // chceme zapnout – zajistíme permission + subscription
        const ok = await enableNotificationsOnClient();
        if (!ok) {
          throw new Error("enableNotificationsOnClient returned false");
        }
      } else {
        // vypínáme – odhlásíme subscription
        await disableNotificationsOnClient();
      }

      // uložíme stav i do BE
      await api.post("profile/notifications", {
        json: { notificationsEnabled: checked },
      });

      await qc.invalidateQueries({ queryKey: ["me"] });
    } catch (err) {
      console.error("notifications toggle failed:", err);
      // rollback UI, pokud cokoliv selže
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
          {isGamified
            ? t("profile.header.titleGamified")
            : t("profile.header.titleControl")}
        </h2>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          {isGamified
            ? t("profile.header.subtitleGamified")
            : t("profile.header.subtitleControl")}
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
          aria-label={t("profile.editButton.aria")}
          title={t("profile.editButton.aria")}
        >
          <Pencil className="w-4 h-4" />
          {t("profile.editButton.label")}
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
              {me.nickname ?? t("profile.fallbackNickname")}
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
                    {t("profile.metrics.levelLabel", { level })}
                  </div>

                  <div className="flex items-center justify-center md:justify-start gap-2 text-sm">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span className={isDark ? "text-white" : "text-gray-900"}>
                      {t("profile.metrics.totalXp", { xp: totalXP })}
                    </span>
                  </div>

                  <div
                    className={`text-xs md:text-sm ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {t("profile.metrics.streakLabel", {
                      current: me.currentStreak ?? 0,
                      best: me.longestStreak ?? 0,
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span
                      className={isDark ? "text-gray-300" : "text-gray-600"}
                    >
                      {t("profile.metrics.progressToNextLevel", {
                        level: level + 1,
                      })}
                    </span>
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-500"}
                    >
                      {t("profile.metrics.progressXp", {
                        current: inLevel,
                        span,
                      })}
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
          {t("profile.theme.title")}
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
              {theme === "day"
                ? t("profile.theme.dayMode")
                : t("profile.theme.nightMode")}
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

      {/* Notifications */}
      <div
        className={`${
          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"
        } rounded-2xl p-6 shadow-md border`}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Bell
              className={`w-5 h-5 ${
                isDark ? "text-emerald-300" : "text-emerald-500"
              }`}
            />
            <div>
              <p className={isDark ? "text-white" : "text-gray-900"}>
                {t("profile.notifications.title")}
              </p>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {t("profile.notifications.description")}
              </p>
            </div>
          </div>

          <Switch
            id="notifications-switch"
            checked={!!me.notificationsEnabled}
            onCheckedChange={handleNotificationsToggle}
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
              {t("profile.badges.title")}
            </h3>
            <span
              className={`ml-auto text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {t("profile.badges.unlockedSummary", {
                unlocked: badges.filter((b) => b.unlocked).length,
                total: badges.length,
              })}
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
                    {t("profile.badges.hiddenTitle")}
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
          {t("profile.experiment.title")}
        </h3>
        <p className={isDark ? "text-gray-400 mb-4" : "text-gray-600 mb-4"}>
          {t("profile.experiment.description")}
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
            {t("profile.experiment.buttonGamified")}
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
            {t("profile.experiment.buttonControl")}
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
