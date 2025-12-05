import { useEffect, useMemo, useState, useRef } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  Heart,
  Leaf,
  Briefcase,
  Users,
  Palette,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { useMe } from "../hooks/useAuth";
import { api } from "../lib/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { FlowerLoader } from "./FlowerLoader";
import {
  SUGGESTED_HABITS_BY_CATEGORY,
  type SuggestedHabit,
} from "../data/suggestedHabits";
import { useTranslation } from "react-i18next";

/* -------------------------------- utils -------------------------------- */
function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

/* -------------------------------- types -------------------------------- */
type Theme = "day" | "night";
type Freq = "Daily" | "Weekly";
type Category =
  | "Health"
  | "Eco"
  | "Productivity"
  | "Relationships"
  | "Creativity";

type StarterHabit = SuggestedHabit & {
  selected?: boolean;
};

interface OnboardingTourProps {
  onComplete: () => void;
  theme: Theme;
  startOnStarter?: boolean;
}

type Step = {
  key: string;
  title: string;
  description: string;
  isConsent?: boolean;
  isNotifications?: boolean;
  isProfileStep?: boolean;
  isStarter?: boolean;
};

const ICONS: Record<
  "heart" | "leaf" | "briefcase" | "users" | "palette",
  LucideIcon
> = {
  heart: Heart,
  leaf: Leaf,
  briefcase: Briefcase,
  users: Users,
  palette: Palette,
};

// stejné emodži jako v EditProfileModal
const EMOJIS = [
  { id: "🌱", emoji: "🌱", name: "Seedling" },
  { id: "🌿", emoji: "🌿", name: "Herb" },
  { id: "🌸", emoji: "🌸", name: "Blossom" },
  { id: "🌻", emoji: "🌻", name: "Sunflower" },
  { id: "🌺", emoji: "🌺", name: "Hibiscus" },
  { id: "🌹", emoji: "🌹", name: "Rose" },
  { id: "🌵", emoji: "🌵", name: "Cactus" },
  { id: "🌳", emoji: "🌳", name: "Tree" },
  { id: "🍀", emoji: "🍀", name: "Clover" },
  { id: "🌾", emoji: "🌾", name: "Grain" },
  { id: "🪴", emoji: "🪴", name: "Potted Plant" },
  { id: "🌼", emoji: "🌼", name: "Daisy" },
];

/* ================================ main ================================= */
export function OnboardingTour({
  onComplete,
  theme,
  startOnStarter,
}: OnboardingTourProps) {
  const { data: me, isLoading } = useMe();
  const qc = useQueryClient();
  const isDark = theme === "night";
  const { t } = useTranslation();

  // zamrazit experiment variantu v okamžiku mountu
  const initialGamified = useRef(
    (me?.experimentVariant ?? "gamified") === "gamified"
  ).current;

  // zamrazit, jestli měl user profil už před spuštěním onboarding flow
  const initialHasProfile = useRef(
    Boolean(me?.nickname && me?.avatar)
  ).current;

  const [consentAccepted, setConsentAccepted] = useState(false);
  const [nick, setNick] = useState(me?.nickname ?? "");
  const [avatar, setAvatar] = useState(me?.avatar ?? "");
  const [activeCats, setActiveCats] = useState<Category[]>([
    "Health",
    "Productivity",
    "Creativity",
  ]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    me?.notificationsEnabled ?? false
  );
  const [habits, setHabits] = useState<StarterHabit[]>(
    (
      Object.values(SUGGESTED_HABITS_BY_CATEGORY).flat() as SuggestedHabit[]
    ).map((h) => ({ ...h, selected: false }))
  );

  const canSaveProfile = useMemo(
    () => nick.trim().length >= 2 && avatar.trim().length > 0,
    [nick, avatar]
  );

  /* ---------- steps definition ---------- */
  const steps = useMemo<Step[]>(() => {
    const intro: Step[] = [
      {
        key: "consent",
        title: t("onboarding.steps.consent.title"),
        description: t("onboarding.steps.consent.description"),
        isConsent: true,
      },
      {
        key: "experiment",
        title: t("onboarding.steps.experiment.title"),
        description: t("onboarding.steps.experiment.description"),
      },
      {
        key: "notifications",
        title: t("onboarding.steps.notifications.title"),
        description: t("onboarding.steps.notifications.description"),
        isNotifications: true,
      },
    ];

    // používáme "initialHasProfile" – steps se během flow už nemění
    const maybeProfile: Step[] = initialHasProfile
      ? []
      : [
          {
            key: "profile",
            title: t("onboarding.steps.profile.title"),
            description: t("onboarding.steps.profile.description"),
            isProfileStep: true,
          },
        ];

    const productIntro: Step[] = initialGamified
      ? [
          {
            key: "garden",
            title: t("onboarding.steps.garden.title"),
            description: t("onboarding.steps.garden.description"),
          },
        ]
      : [
          {
            key: "simple",
            title: t("onboarding.steps.simple.title"),
            description: t("onboarding.steps.simple.description"),
          },
        ];

    const starters: Step[] = [
      {
        key: "starters",
        title: t("onboarding.steps.starters.title"),
        description: t("onboarding.steps.starters.description"),
        isStarter: true,
      },
    ];

    return [...intro, ...maybeProfile, ...productIntro, ...starters];
  }, [initialHasProfile, initialGamified, t]);

  /* ---------- current step ---------- */
  const [currentStep, setCurrentStep] = useState(0);

  // pokud máme startOnStarter, přepneme až po prvním spočítání steps
  useEffect(() => {
    if (startOnStarter) {
      setCurrentStep(Math.max(steps.length - 1, 0));
    }
  }, [startOnStarter, steps.length]);

  // když se steps změní (teď už prakticky jen kvůli překladu), ořízni index
  useEffect(() => {
    setCurrentStep((i) => {
      if (i > steps.length - 1) return steps.length - 1;
      return i;
    });
  }, [steps.length]);

  // bezpečný index + current step
  const currentStepIndex = Math.min(currentStep, Math.max(steps.length - 1, 0));
  const current = steps[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;

  // sync z /me do lokálního stavu (ale už nemění strukturu steps)
  useEffect(() => {
    if (me?.nickname) setNick(me.nickname);
    if (me?.avatar) setAvatar(me.avatar);
    if (typeof me?.notificationsEnabled === "boolean") {
      setNotificationsEnabled(me.notificationsEnabled);
    }
  }, [me?.nickname, me?.avatar, me?.notificationsEnabled]);

  const visibleHabits = useMemo(
    () => habits.filter((h) => activeCats.includes(h.category)),
    [habits, activeCats]
  );

  /* ---------- helpers ---------- */
  const toggleCat = (c: Category) =>
    setActiveCats((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  const setHabitSelected = (id: string, s: boolean) =>
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, selected: s } : h))
    );

  const setHabitFrequency = (id: string, f: Freq) =>
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, frequency: f } : h))
    );

  const saveProfile = async () => {
    if (!canSaveProfile) return;

    const nickname = nick.trim();
    const prev = qc.getQueryData(["me"]);

    qc.setQueryData(["me"], (curr: unknown) =>
      curr && typeof curr === "object"
        ? { ...(curr as any), nickname, avatar }
        : curr
    );

    try {
      await api.post("profile/update", { json: { nickname, avatar } });
      await qc.invalidateQueries({ queryKey: ["me"] });
    } catch (e) {
      console.error("profile/update in onboarding failed:", e);
      qc.setQueryData(["me"], prev);
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleNext = async () => {
    if (!current) return;

    // consent krok – bez checkboxu nepouštíme dál
    if (current.isConsent && !consentAccepted) return;
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      // notifications krok – uložit preferenci do BE
      if (current.isNotifications) {
        const prev = qc.getQueryData(["me"]);
        qc.setQueryData(["me"], (curr: unknown) =>
          curr && typeof curr === "object"
            ? { ...(curr as any), notificationsEnabled }
            : curr
        );

        try {
          await api.post("profile/notifications", {
            json: { notificationsEnabled },
          });
          await qc.invalidateQueries({ queryKey: ["me"] });
        } catch (err) {
          console.error("profile/notifications in onboarding failed:", err);
          qc.setQueryData(["me"], prev);
          // uživatele dál pustíme
        }
      }

      // profil krok – musí být validní
      if (current.isProfileStep) {
        if (!canSaveProfile) return;
        await saveProfile();
      }

      // poslední krok – založení startovacích habitů (volitelné)
      if (isLast) {
        if (current.isStarter) {
          const selected = habits.filter((h) => h.selected);
          if (selected.length) {
            await api.post("habits/bulk", {
              json: {
                habits: selected.map((h) => ({
                  title: h.title,
                  category: h.category,
                  icon: h.icon,
                  frequency: h.frequency,
                  worth: h.worth ?? 10,
                })),
              },
            });

            await qc.invalidateQueries({ queryKey: ["habits", "mine"] });
            await qc.invalidateQueries({ queryKey: ["me"] });
          }
        }
        onComplete();
        return;
      }

      setCurrentStep((s) => Math.min(s + 1, Math.max(steps.length - 1, 0)));
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep((s) => Math.max(s - 1, 0));
    }
  };

  if (isLoading) {
    return <FlowerLoader theme={theme} />;
  }

  if (!current) {
    // fallback – teoreticky by se nemělo stát, ale pro jistotu
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onComplete}
      />

      <div
        className={cn(
          "relative flex flex-col max-h-[90vh] w-full max-w-lg rounded-2xl shadow-2xl p-8 border overflow-y-auto",
          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-green-200"
        )}
      >
        {/* close */}
        <button
          onClick={onComplete}
          className={cn(
            "absolute top-4 right-4",
            isDark
              ? "text-gray-400 hover:text-gray-200"
              : "text-gray-400 hover:text-gray-600"
          )}
        >
          <X className="w-5 h-5" />
        </button>

        {/* header icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* title & description */}
        <div className="text-center mb-6">
          <h3 className={cn("mb-2", isDark ? "text-white" : "text-gray-900")}>
            {current.title}
          </h3>
          <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
            {current.description}
          </p>
        </div>

        {/* consent step */}
        {current.isConsent && (
          <ConsentStep
            isDark={isDark}
            accepted={consentAccepted}
            setAccepted={setConsentAccepted}
          />
        )}

        {/* profile step */}
        {current.isProfileStep && (
          <ProfileStep
            isDark={isDark}
            nick={nick}
            setNick={setNick}
            avatar={avatar}
            setAvatar={setAvatar}
          />
        )}

        {/* notifications step */}
        {current.isNotifications && (
          <NotificationsStep
            isDark={isDark}
            enabled={notificationsEnabled}
            setEnabled={setNotificationsEnabled}
          />
        )}

        {/* starters */}
        {current.isStarter && (
          <StarterPicker
            theme={theme}
            active={activeCats}
            toggle={toggleCat}
            items={visibleHabits}
            setSel={setHabitSelected}
            setFreq={setHabitFrequency}
          />
        )}

        {/* nav */}
        <div className="flex items-center justify-between mt-8">
          <div>
            {!isFirst && (
              <Button
                onClick={handlePrev}
                disabled={isFirst || isProcessing}
                variant="outline"
                className={cn(
                  "rounded-xl",
                  isDark
                    ? "border-slate-600 text-gray-300 hover:bg-slate-700"
                    : ""
                )}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("onboarding.actions.previous")}
              </Button>
            )}
          </div>

          <Button
            onClick={handleNext}
            disabled={
              isProcessing ||
              (current.isConsent && !consentAccepted) ||
              (current.isProfileStep && !canSaveProfile)
            }
            className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            {isLast
              ? t("onboarding.actions.letsGo")
              : t("onboarding.actions.next")}
            {!isLast && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ ConsentStep ----------------------------- */
function ConsentStep({
  isDark,
  accepted,
  setAccepted,
}: {
  isDark: boolean;
  accepted: boolean;
  setAccepted: (v: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "rounded-xl border p-4 text-sm",
        isDark
          ? "border-slate-600 bg-slate-700/40 text-gray-200"
          : "border-green-200 bg-green-50/60 text-gray-800"
      )}
    >
      <p className="mb-3">{t("onboarding.consent.text")}</p>
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="w-4 h-4 accent-emerald-600"
        />
        <span>{t("onboarding.consent.checkbox")}</span>
      </label>
    </div>
  );
}

/* ------------------------------ ProfileStep ----------------------------- */
function ProfileStep({
  isDark,
  nick,
  setNick,
  avatar,
  setAvatar,
}: {
  isDark: boolean;
  nick: string;
  setNick: (v: string) => void;
  avatar: string;
  setAvatar: (v: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      {/* Nickname */}
      <div className="space-y-2">
        <label
          className={cn(
            "block text-sm font-medium",
            isDark ? "text-gray-300" : "text-gray-800"
          )}
        >
          {t("profile.nickname.label")}
        </label>
        <Input
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          maxLength={24}
          placeholder={t("profile.nickname.placeholder")}
          className={cn(
            "rounded-md",
            isDark
              ? "bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
              : "bg-white border-green-200 text-gray-900 placeholder:text-gray-400"
          )}
        />
      </div>

      {/* Avatar / emoji – stejná logika jako v EditProfileModal */}
      <div className="space-y-2">
        <div
          className={cn(
            "text-sm font-medium",
            isDark ? "text-gray-300" : "text-gray-800"
          )}
        >
          {t("profile.avatar.label")}
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
          {EMOJIS.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setAvatar(e.emoji)}
              className={cn(
                "p-2.5 sm:p-3 rounded-xl border-2 text-base sm:text-lg transition-all duration-200",
                avatar === e.emoji
                  ? "border-green-500 bg-green-50"
                  : isDark
                  ? "border-slate-600 bg-slate-700 hover:border-slate-500"
                  : "border-gray-300 bg-gray-50 hover:border-gray-400"
              )}
              aria-label={e.name}
            >
              {e.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ NotificationsStep ----------------------- */
function NotificationsStep({
  isDark,
  enabled,
  setEnabled,
}: {
  isDark: boolean;
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "rounded-xl border p-4 flex items-center justify-between gap-4",
        isDark
          ? "border-slate-600 bg-slate-700/40 text-gray-200"
          : "border-green-200 bg-green-50/60 text-gray-800"
      )}
    >
      <div className="max-w-[75%]">
        <p className="font-medium mb-1">{t("profile.notifications.title")}</p>
        <p className="text-sm opacity-80">
          {t("profile.notifications.description")}
        </p>
      </div>

      <Switch checked={enabled} onCheckedChange={setEnabled} />
    </div>
  );
}

/* ------------------------------ StarterPicker --------------------------- */
function StarterPicker({
  theme,
  active,
  toggle,
  items,
  setSel,
  setFreq,
}: {
  theme: Theme;
  active: Category[];
  toggle: (c: Category) => void;
  items: StarterHabit[];
  setSel: (id: string, s: boolean) => void;
  setFreq: (id: string, f: Freq) => void;
}) {
  const isDark = theme === "night";
  const { t } = useTranslation();

  const CATS: { id: Category; labelKey: string; icon: LucideIcon }[] = [
    { id: "Health", labelKey: "Health", icon: Heart },
    { id: "Eco", labelKey: "Eco", icon: Leaf },
    { id: "Productivity", labelKey: "Productivity", icon: Briefcase },
    { id: "Relationships", labelKey: "Relationships", icon: Users },
    { id: "Creativity", labelKey: "Creativity", icon: Palette },
  ];

  return (
    <div className="space-y-5">
      {/* category chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {CATS.map(({ id, labelKey, icon: Icon }) => {
          const on = active.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs sm:text-sm transition-colors",
                on
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : isDark
                  ? "border-slate-600 text-slate-200 hover:bg-slate-700"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon className="w-4 h-4" />
              {t(`habits.categories.${labelKey}`)}
            </button>
          );
        })}
      </div>

      {/* habit cards */}
      <div className="grid grid-cols-1 gap-4">
        {active.flatMap((cat) => {
          const catHabits = SUGGESTED_HABITS_BY_CATEGORY[cat] ?? [];
          return catHabits.map((h) => {
            const Icon = ICONS[h.icon];
            const item = items.find((x) => x.id === h.id);
            const selected = item?.selected ?? false;
            const frequency = item?.frequency ?? h.frequency;

            const toggleSelect = () => setSel(h.id, !selected);

            return (
              <div
                key={h.id}
                onClick={toggleSelect}
                className={cn(
                  "relative flex flex-col justify-between gap-4 p-4 sm:p-5 rounded-xl border transition-all duration-200 overflow-visible cursor-pointer",
                  selected
                    ? "border-emerald-500 ring-1 ring-emerald-200/60 bg-emerald-50/10"
                    : isDark
                    ? "border-slate-600 hover:bg-slate-700"
                    : "border-gray-200 hover:bg-gray-50"
                )}
              >
                {/* selected chip */}
                <div
                  className={cn(
                    "absolute top-3 right-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] sm:text-xs border",
                    selected
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : isDark
                      ? "border-slate-600 text-slate-200"
                      : "border-gray-200 text-gray-700"
                  )}
                >
                  {selected && <Check className="w-3.5 h-3.5" />}
                  {selected
                    ? t("profile.starters.selected")
                    : t("profile.starters.select")}
                </div>

                {/* top part: icon + title + category */}
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                      isDark ? "bg-slate-700" : "bg-emerald-100"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 sm:w-6 sm:h-6",
                        isDark ? "text-gray-300" : "text-emerald-600"
                      )}
                    />
                  </div>
                  <div className="flex flex-col min-w-0 pr-12 pt-0.5">
                    <span
                      className={cn(
                        "font-semibold text-sm sm:text-base leading-snug break-words",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      {t("habits.suggestions." + h.id + ".title")}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] sm:text-xs mt-1",
                        isDark ? "text-gray-400" : "text-gray-500"
                      )}
                    >
                      {t(`habits.categories.${h.category}`)}
                    </span>
                  </div>
                </div>

                {/* frequency select – klik na select nevyvolá toggle */}
                <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={frequency}
                    onValueChange={(v) => setFreq(h.id, v as Freq)}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-9 sm:h-10 rounded-md text-sm w-full",
                        isDark ? "bg-slate-700 border-slate-600 text-white" : ""
                      )}
                    >
                      <SelectValue
                        placeholder={t("profile.starters.frequency")}
                      />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className={cn(
                        "z-[60]",
                        isDark ? "bg-slate-700 border-slate-600 text-white" : ""
                      )}
                    >
                      <SelectItem value="Daily">
                        {t("habits.frequency.Daily")}
                      </SelectItem>
                      <SelectItem value="Weekly">
                        {t("habits.frequency.Weekly")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}