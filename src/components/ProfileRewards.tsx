import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Award, Sun, Moon, Zap, Pencil, User as UserIcon } from "lucide-react";
import { BadgeIcon } from "./BadgeIcon";
import { Progress } from "./ui/progress";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useMe } from "../hooks/useAuth";
import { api } from "../lib/api";
import EditProfileModal from "./UpdateProfileModal";

function xpForLevel(level: number) {
  // jednoduchá křivka: 100 XP / level (můžeš později nahradit)
  return level * 100;
}

export function ProfileRewards() {
  const [editOpen, setEditOpen] = useState(false);
  const { data: me, isLoading } = useMe();
  const qc = useQueryClient();

  if (isLoading || !me) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 border bg-white/70 animate-pulse h-40" />
        <div className="rounded-2xl p-6 border bg-white/70 animate-pulse h-28" />
        <div className="rounded-2xl p-6 border bg-white/70 animate-pulse h-64" />
      </div>
    );
  }

  const theme = me.theme ?? "day";
  const isDark = theme === "night";
  const currentVariant = (me.experimentVariant ?? "gamified") as "gamified" | "control";
  const isGamified = currentVariant === "gamified";

  // --- gamified data only (počítáme jen když je potřeba)
  const level = me.level ?? 1;
  const totalXP = me.xp ?? 0;
  const nextLevelXP = xpForLevel(level);
  const prevLevelXP = xpForLevel(Math.max(0, level - 1));
  const progressInLevel = Math.max(0, totalXP - prevLevelXP);
  const progressMax = Math.max(1, nextLevelXP - prevLevelXP);
  const progressPercent = Math.min(100, (progressInLevel / progressMax) * 100);

  const badges = [
    { type: "firstStep",   unlocked: totalXP >= 10,                  name: "First Step",   description: "Complete your first habit" },
    { type: "weekWarrior", unlocked: (me.currentStreak ?? 0) >= 7,   name: "Week Warrior", description: "7-day streak achieved" },
    { type: "consistent",  unlocked: (me.longestStreak ?? 0) >= 30,  name: "Consistent",   description: "30-day streak achieved" },
    { type: "powerUser",   unlocked: level >= 10,                    name: "Power User",   description: "Reach level 10" },
    { type: "legendary",   unlocked: (me.longestStreak ?? 0) >= 100, name: "Legendary",    description: "100-day streak" },
    { type: "dedicated",   unlocked: totalXP >= 10000,               name: "Dedicated",    description: "Complete 1000 habits" },
  ];

  // --- Actions
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
        {/* Edit button – pravý horní roh */}
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

        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md text-white text-4xl">
            {me.avatar ? <span>{me.avatar}</span> : <UserIcon className="w-10 h-10" />}
          </div>

          <div className="flex-1">
            <h3 className={`mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
              {me.nickname ?? "Habit Gardener"}
            </h3>
            <p className={`${isDark ? "text-gray-400" : "text-gray-600"} mb-4`}>{me.email}</p>

            {/* Gamified metrics – jen když je varianta gamified */}
            {isGamified && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`px-4 py-2 rounded-full text-white shadow-sm ${
                      isDark
                        ? "bg-gradient-to-r from-green-600 to-emerald-700"
                        : "bg-gradient-to-r from-green-500 to-emerald-500"
                    }`}
                  >
                    Level {level}
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span className={isDark ? "text-white" : "text-gray-900"}>
                      {totalXP} Total XP
                    </span>
                  </div>
                  <div className={isDark ? "text-gray-300" : "text-gray-700"}>
                    🔥 Streak: {me.currentStreak ?? 0} (best {me.longestStreak ?? 0})
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                      Progress to Level {level + 1}
                    </span>
                    <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                      {progressInLevel} / {progressMax} XP
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
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
        <h3 className={`mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Theme Preferences</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sun className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-amber-500"}`} />
            <Label htmlFor="theme-switch" className={isDark ? "text-gray-300" : "text-gray-700"}>
              {theme === "day" ? "Day Mode" : "Night Mode"}
            </Label>
            <Moon className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-gray-400"}`} />
          </div>
          <Switch id="theme-switch" checked={theme === "night"} onCheckedChange={handleThemeToggle} />
        </div>
      </div>

      {/* Badges Section – jen pro gamified */}
      {isGamified && (
        <div
          className={`${
            isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"
          } rounded-2xl p-6 shadow-md border`}
        >
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-purple-500" />
            <h3 className={isDark ? "text-white" : "text-gray-900"}>Earned Badges</h3>
            <span className={`ml-auto text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {badges.filter((b) => b.unlocked).length} of {badges.length} unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map((badge, idx) => (
              <BadgeIcon
                key={idx}
                type={badge.type as any}
                unlocked={badge.unlocked}
                name={badge.name}
                description={badge.description}
                theme={theme}
              />
            ))}
          </div>
        </div>
      )}
{/* Experiment Variant Selector */}
      <div
        className={`${
          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"
        } rounded-2xl p-6 shadow-md border`}
      >
        <h3 className={`mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Experiment Variant</h3>
        <p className={isDark ? "text-gray-400 mb-4" : "text-gray-600 mb-4"}>
          Switch between the gamified experience (XP, levels, badges) and the minimal experience (no gamification).
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
      <EditProfileModal open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
