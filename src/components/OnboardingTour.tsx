import { useEffect, useMemo, useState } from "react";
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
import { Button } from "./ui/button";
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

interface OnboardingTourProps {
  onComplete: () => void;
  theme: Theme;
  startOnStarter?: boolean;
}

type StarterHabit = {
  id: string;
  title: string;
  category: Category;
  icon: "heart" | "leaf" | "briefcase" | "users" | "palette";
  frequency: Freq;
  selected?: boolean;
  worth?: number;
};

const ICONS = {
  heart: Heart,
  leaf: Leaf,
  briefcase: Briefcase,
  users: Users,
  palette: Palette,
};

/* --------------------------- suggested habits --------------------------- */
const SUGGESTED: Record<Category, Omit<StarterHabit, "selected">[]> = {
  Health: [
    {
      id: "h1",
      title: "Drink 8 glasses of water",
      category: "Health",
      icon: "heart",
      frequency: "Daily",
      worth: 20,
    },
    {
      id: "h2",
      title: "Sleep 7–8 hours",
      category: "Health",
      icon: "heart",
      frequency: "Daily",
      worth: 25,
    },
    {
      id: "h3",
      title: "Stretch or move for 10 minutes",
      category: "Health",
      icon: "heart",
      frequency: "Daily",
      worth: 15,
    },
    {
      id: "h4",
      title: "Go for a walk outdoors",
      category: "Health",
      icon: "heart",
      frequency: "Daily",
      worth: 20,
    },
    {
      id: "h5",
      title: "Eat a balanced breakfast",
      category: "Health",
      icon: "heart",
      frequency: "Daily",
      worth: 15,
    },
  ],
  Productivity: [
    {
      id: "p1",
      title: "Plan 3 priorities for the day",
      category: "Productivity",
      icon: "briefcase",
      frequency: "Daily",
      worth: 20,
    },
    {
      id: "p2",
      title: "Focus 25 minutes (Pomodoro)",
      category: "Productivity",
      icon: "briefcase",
      frequency: "Daily",
      worth: 15,
    },
    {
      id: "p3",
      title: "Check off one postponed task",
      category: "Productivity",
      icon: "briefcase",
      frequency: "Daily",
      worth: 20,
    },
    {
      id: "p4",
      title: "Organize workspace",
      category: "Productivity",
      icon: "briefcase",
      frequency: "Weekly",
      worth: 30,
    },
    {
      id: "p5",
      title: "Review your week",
      category: "Productivity",
      icon: "briefcase",
      frequency: "Weekly",
      worth: 50,
    },
  ],
  Relationships: [
    {
      id: "r1",
      title: "Send a kind message",
      category: "Relationships",
      icon: "users",
      frequency: "Daily",
      worth: 15,
    },
    {
      id: "r2",
      title: "Call or visit family",
      category: "Relationships",
      icon: "users",
      frequency: "Weekly",
      worth: 40,
    },
    {
      id: "r3",
      title: "Compliment someone",
      category: "Relationships",
      icon: "users",
      frequency: "Daily",
      worth: 10,
    },
    {
      id: "r4",
      title: "Meet a friend offline",
      category: "Relationships",
      icon: "users",
      frequency: "Weekly",
      worth: 30,
    },
    {
      id: "r5",
      title: "Write 3 gratitudes",
      category: "Relationships",
      icon: "users",
      frequency: "Daily",
      worth: 15,
    },
  ],
  Eco: [
    {
      id: "e1",
      title: "Sort your recycling",
      category: "Eco",
      icon: "leaf",
      frequency: "Weekly",
      worth: 20,
    },
    {
      id: "e2",
      title: "Bring your own bottle/cup",
      category: "Eco",
      icon: "leaf",
      frequency: "Daily",
      worth: 15,
    },
    {
      id: "e3",
      title: "Turn off unused lights",
      category: "Eco",
      icon: "leaf",
      frequency: "Daily",
      worth: 20,
    },
    {
      id: "e4",
      title: "Buy local or seasonal food",
      category: "Eco",
      icon: "leaf",
      frequency: "Weekly",
      worth: 30,
    },
  ],
  Creativity: [
    {
      id: "c1",
      title: "Sketch or doodle for 10 minutes",
      category: "Creativity",
      icon: "palette",
      frequency: "Daily",
      worth: 25,
    },
    {
      id: "c2",
      title: "Write a short journal entry",
      category: "Creativity",
      icon: "palette",
      frequency: "Daily",
      worth: 20,
    },
    {
      id: "c3",
      title: "Take an inspiring photo",
      category: "Creativity",
      icon: "palette",
      frequency: "Daily",
      worth: 15,
    },
    {
      id: "c4",
      title: "Work on a creative hobby",
      category: "Creativity",
      icon: "palette",
      frequency: "Weekly",
      worth: 40,
    },
    {
      id: "c5",
      title: "Consume something inspiring",
      category: "Creativity",
      icon: "palette",
      frequency: "Daily",
      worth: 20,
    },
  ],
};

/* ================================ main ================================= */
export function OnboardingTour({
  onComplete,
  theme,
  startOnStarter,
}: OnboardingTourProps) {
  // --- hooks only at top-level ---
  const { data: me, isLoading } = useMe();
  const qc = useQueryClient();
  const isDark = theme === "night";

  // local state (not conditional)
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [nick, setNick] = useState(me?.nickname ?? "");
  const [avatar, setAvatar] = useState(me?.avatar ?? "");
  const [activeCats, setActiveCats] = useState<Category[]>([
    "Health",
    "Productivity",
    "Creativity",
  ]);
  const [habits, setHabits] = useState<StarterHabit[]>(
    Object.values(SUGGESTED)
      .flat()
      .map((h) => ({ ...h, selected: false }))
  );

  const hasProfile = Boolean(me?.nickname && me?.avatar);
  const isGamified = (me?.experimentVariant ?? "gamified") === "gamified";

  // steps are derived, but memoized; not a hook call in a branch
  const steps = useMemo(() => {
    // 1) intro with consent + experiment info
    const intro = [
      {
        key: "consent",
        title: "About this project 🌿",
        description:
          "This app is part of a bachelor thesis. Anonymous usage data is collected for academic research.",
        isConsent: true,
      },
      {
        key: "experiment",
        title: "Two versions 🎮",
        description:
          "There is a gamified and a non-gamified version. You were assigned randomly — please try the assigned version first, then you can switch.",
      },
    ] as const;

    // 2) profile step (only if needed)
    const maybeProfile = hasProfile
      ? []
      : [
          {
            key: "profile",
            title: "Create Your Profile 🌸",
            description:
              "Pick a nickname and avatar to personalize your experience.",
            isProfileStep: true,
          },
        ];

    // 3) product intro + starters
    const productIntro = isGamified
      ? [
          {
            key: "garden",
            title: "Your Habit Garden 🌱",
            description:
              "Each habit becomes a plant. Water them to earn XP and watch your garden grow.",
          },
        ]
      : [
          {
            key: "simple",
            title: "Stay Consistent 📅",
            description:
              "Track your daily and weekly habits easily with a clean, simple dashboard.",
          },
        ];

    const starters = [
      {
        key: "starters",
        title: "Pick Starter Habits 🌟",
        description:
          "Filter categories and select a few habits you’d like to focus on first.",
        isStarter: true,
      },
    ];

    return [...intro, ...maybeProfile, ...productIntro, ...starters];
  }, [hasProfile, isGamified]);

  // current step index (ensure valid if steps change)
  const [currentStep, setCurrentStep] = useState(() =>
    startOnStarter ? steps.length - 1 : 0
  );
  useEffect(() => {
    setCurrentStep((i) => Math.min(i, steps.length - 1));
  }, [steps.length]);

  // keep inputs in sync if me changes after mount
  useEffect(() => {
    if (me?.nickname) setNick(me.nickname);
    if (me?.avatar) setAvatar(me.avatar);
  }, [me?.nickname, me?.avatar]);

  // derived
  const visibleHabits = useMemo(
    () => habits.filter((h) => activeCats.includes(h.category)),
    [habits, activeCats]
  );
  const current = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  // handlers (no hooks here)
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
    await api.patch("auth/me", { json: { nickname: nick.trim(), avatar } });
    await qc.invalidateQueries({ queryKey: ["me"] });
  };

  const handleNext = async () => {
    if ((current as any).isConsent && !consentAccepted) return;

    if ((current as any).isProfileStep) {
      if (!nick.trim() || !avatar.trim()) return;
      await saveProfile();
    }

    if (isLast) {
      if ((current as any).isStarter) {
        // vezmeme všechny vybrané, i když zrovna nejsou ve filtru
        const selected = habits.filter((h) => h.selected);
        if (selected.length) {
          await api.post("habits/bulk", {
            json: {
              habits: selected.map((h) => ({
                title: h.title,
                category: h.category, // "Health" | "Eco" | "Productivity" | "Relationships" | "Creativity"
                icon: h.icon, // "heart" | "leaf" | "briefcase" | "users" | "palette"
                frequency: h.frequency, // "Daily" | "Weekly"
                worth: h.worth ?? 10, // ← DŮLEŽITÉ: pošli skutečný worth!
              })),
            },
          });

          // po vytvoření si stáhni znovu habits i me (kvůli případné inicializaci XP na BE)
          await qc.invalidateQueries({ queryKey: ["habits", "mine"] });
          await qc.invalidateQueries({ queryKey: ["me"] });
        }
      }
      onComplete();
      return;
    }
    setCurrentStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (!isFirst) setCurrentStep((s) => s - 1);
  };

  // auto-skip profile step if se mezitím doplnil
  useEffect(() => {
    if (hasProfile && (current as any)?.isProfileStep) {
      setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasProfile]);

  // loading overlay (hooky už jsou inicializované nahoře, early return je OK)
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
        <div className="text-white text-lg font-medium">Loading profile…</div>
      </div>
    );
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
            {(current as any).title}
          </h3>
          <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
            {(current as any).description}
          </p>
        </div>

        {/* consent step */}
        {(current as any).isConsent && (
          <ConsentStep
            isDark={isDark}
            accepted={consentAccepted}
            setAccepted={setConsentAccepted}
          />
        )}

        {/* profile step */}
        {(current as any).isProfileStep && (
          <ProfileStep
            isDark={isDark}
            nick={nick}
            setNick={setNick}
            avatar={avatar}
            setAvatar={setAvatar}
          />
        )}

        {/* starters */}
        {(current as any).isStarter && (
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
          <Button
            onClick={handlePrev}
            disabled={isFirst}
            variant="outline"
            className={cn(
              "rounded-xl",
              isDark ? "border-slate-600 text-gray-300 hover:bg-slate-700" : ""
            )}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={(current as any).isConsent && !consentAccepted}
            className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            {isLast ? "Let's Go!" : "Next"}
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
  return (
    <div
      className={cn(
        "rounded-xl border p-4 text-sm",
        isDark
          ? "border-slate-600 bg-slate-700/40 text-gray-200"
          : "border-green-200 bg-green-50/60 text-gray-800"
      )}
    >
      <p className="mb-3">
        By continuing, you agree that <b>anonymous usage data</b> may be
        collected for an academic study (Bachelor’s thesis) to evaluate the
        impact of gamification. Data will not include personal content and will
        be used only in aggregate.
      </p>
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="w-4 h-4 accent-emerald-600"
        />
        <span>I understand and agree</span>
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
  return (
    <div className="space-y-4">
      <div>
        <label
          className={cn(
            "block text-sm mb-1",
            isDark ? "text-gray-300" : "text-gray-700"
          )}
        >
          Nickname
        </label>
        <input
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          maxLength={24}
          className={cn(
            "w-full h-10 px-3 rounded-md border",
            isDark
              ? "bg-slate-700 border-slate-600 text-white"
              : "bg-white border-green-200"
          )}
          placeholder="e.g., BelSunflower"
        />
      </div>

      <div>
        <label
          className={cn(
            "block text-sm mb-1",
            isDark ? "text-gray-300" : "text-gray-700"
          )}
        >
          Avatar URL
        </label>
        <input
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          className={cn(
            "w-full h-10 px-3 rounded-md border",
            isDark
              ? "bg-slate-700 border-slate-600 text-white"
              : "bg-white border-green-200"
          )}
          placeholder="https://…/avatar.png"
        />
      </div>
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
  const CATS: { id: Category; label: string; icon: any }[] = [
    { id: "Health", label: "Health", icon: Heart },
    { id: "Eco", label: "Eco", icon: Leaf },
    { id: "Productivity", label: "Productivity", icon: Briefcase },
    { id: "Relationships", label: "Relationships", icon: Users },
    { id: "Creativity", label: "Creativity", icon: Palette },
  ];

  return (
    <div className="space-y-5">
      {/* categories */}
      <div className="flex flex-wrap justify-center gap-2">
        {CATS.map(({ id, label, icon: Icon }) => {
          const on = active.includes(id);
          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors",
                on
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : isDark
                  ? "border-slate-600 text-slate-200 hover:bg-slate-700"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* list – one column, whole card clickable */}
      <div className="grid grid-cols-1 gap-4">
        {active.flatMap((cat) =>
          SUGGESTED[cat].map((h) => {
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
                  "relative flex flex-col justify-between p-5 rounded-xl border transition-all duration-200 overflow-visible cursor-pointer",
                  selected
                    ? "border-emerald-500 ring-1 ring-emerald-200/60 bg-emerald-50/10"
                    : isDark
                    ? "border-slate-600 hover:bg-slate-700"
                    : "border-gray-200 hover:bg-gray-50"
                )}
              >
                {/* selected chip (no stopPropagation -> celá karta funguje) */}
                <div
                  className={cn(
                    "absolute top-3 right-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border",
                    selected
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : isDark
                      ? "border-slate-600 text-slate-200"
                      : "border-gray-200 text-gray-700"
                  )}
                >
                  {selected && <Check className="w-3.5 h-3.5" />}
                  {selected ? "Selected" : "Select"}
                </div>

                {/* top */}
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                      isDark ? "bg-slate-700" : "bg-emerald-100"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-6 h-6",
                        isDark ? "text-gray-300" : "text-emerald-600"
                      )}
                    />
                  </div>
                  <div className="flex flex-col min-w-0 pr-16">
                    <span
                      className={cn(
                        "font-semibold text-base leading-snug break-words",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      {h.title}
                    </span>
                    <span
                      className={cn(
                        "text-xs mt-1",
                        isDark ? "text-gray-400" : "text-gray-500"
                      )}
                    >
                      {h.category}
                    </span>
                  </div>
                </div>

                {/* frequency select (stop click from toggling selection) */}
                <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={frequency}
                    onValueChange={(v) => setFreq(h.id, v as Freq)}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-10 rounded-md text-sm w-full",
                        isDark ? "bg-slate-700 border-slate-600 text-white" : ""
                      )}
                    >
                      <SelectValue placeholder="Frequency" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className={cn(
                        "z-[60]",
                        isDark ? "bg-slate-700 border-slate-600 text-white" : ""
                      )}
                    >
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
