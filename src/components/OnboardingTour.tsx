import { useMemo, useState } from "react";
import { Button } from "./ui/button";
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
} from "lucide-react";
import { useMe } from "../hooks/useAuth";
import { api } from "../lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useQueryClient } from "@tanstack/react-query";


function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

interface OnboardingTourProps {
  onComplete: () => void;
  theme: "day" | "night";
  startOnStarter?: boolean;
}

type StarterHabit = {
  id: string;
  title: string;
  category: "Health" | "Eco" | "Productivity" | "Relationships";
  icon: "heart" | "leaf" | "briefcase" | "users";
  frequency: "Daily" | "Weekly";
  selected?: boolean;
};

const ICONS = { heart: Heart, leaf: Leaf, briefcase: Briefcase, users: Users };

const SUGGESTED: Record<
  StarterHabit["category"],
  Omit<StarterHabit, "selected">[]
> = {
  Health: [
    { id: "h1", title: "Drink 8 glasses of water", category: "Health", icon: "heart", frequency: "Daily" },
    { id: "h2", title: "Morning stretch (5 min)", category: "Health", icon: "heart", frequency: "Daily" },
    { id: "h3", title: "Go for a 20-min walk", category: "Health", icon: "heart", frequency: "Daily" },
    { id: "h4", title: "Sleep 7+ hours", category: "Health", icon: "heart", frequency: "Daily" },
    { id: "h5", title: "No sugar drinks", category: "Health", icon: "heart", frequency: "Weekly" },
  ],
  Productivity: [
    { id: "p1", title: "Plan top 3 tasks", category: "Productivity", icon: "briefcase", frequency: "Daily" },
    { id: "p2", title: "Inbox zero sprint (15m)", category: "Productivity", icon: "briefcase", frequency: "Daily" },
    { id: "p3", title: "Weekly review", category: "Productivity", icon: "briefcase", frequency: "Weekly" },
    { id: "p4", title: "Focus 25 min (Pomodoro)", category: "Productivity", icon: "briefcase", frequency: "Daily" },
  ],
  Eco: [
    { id: "e1", title: "Sort recycling", category: "Eco", icon: "leaf", frequency: "Daily" },
    { id: "e2", title: "Meatless day", category: "Eco", icon: "leaf", frequency: "Weekly" },
    { id: "e3", title: "Avoid single-use plastic", category: "Eco", icon: "leaf", frequency: "Daily" },
  ],
  Relationships: [
    { id: "r1", title: "Send a kind message", category: "Relationships", icon: "users", frequency: "Daily" },
    { id: "r2", title: "Quality time (30m)", category: "Relationships", icon: "users", frequency: "Weekly" },
    { id: "r3", title: "Call parents", category: "Relationships", icon: "users", frequency: "Weekly" },
    { id: "r4", title: "Compliment someone", category: "Relationships", icon: "users", frequency: "Daily" },
  ],
};

export function OnboardingTour({ onComplete, theme, startOnStarter }: OnboardingTourProps) {
  const { data: me } = useMe();
  const isDark = theme === "night";
  const isGamified = (me?.experimentVariant ?? "gamified") === "gamified";

  const steps = useMemo(() => {
    if (isGamified) {
      return [
        { title: "Welcome to Your Garden 🌱", description: "Each habit is a plant that grows with your consistency." },
        { title: "Watch Your Plants Grow 🌿", description: "Water habits daily and watch them flourish." },
        { title: "Build Streaks & XP 🔥", description: "Earn XP for every completed habit and level up your garden." },
        { title: "Pick Your Starter Habits 🎯", description: "Select a few popular habits to start growing.", isStarter: true },
      ] as const;
    }
    return [
      { title: "Welcome 👋", description: "Track your daily and weekly habits easily." },
      { title: "Stay Consistent", description: "Monitor your progress and maintain consistency." },
      { title: "Pick Your Starter Habits", description: "Select a few habits to get started.", isStarter: true },
    ] as const;
  }, [isGamified]);

  const [currentStep, setCurrentStep] = useState(() => startOnStarter ? steps.length - 1 : 0);
  const [habits, setHabits] = useState<StarterHabit[]>(() => [
    ...SUGGESTED.Health.slice(0, 2),
    ...SUGGESTED.Productivity.slice(0, 2),
  ].map((h) => ({ ...h, selected: true })));
  const [activeCategories, setActiveCategories] = useState<StarterHabit["category"][]>(["Health", "Productivity"]);
  const [bulkSaving, setBulkSaving] = useState(false);

  const toggleCategory = (cat: StarterHabit["category"]) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    if (!activeCategories.includes(cat)) {
      const news = SUGGESTED[cat].slice(0, 2).map((h) => ({ ...h, selected: true }));
      setHabits((prev) => {
        const existing = new Set(prev.map((p) => p.id));
        return [...prev, ...news.filter((n) => !existing.has(n.id))];
      });
    }
  };

  const setHabitSelected = (id: string, s: boolean) =>
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, selected: s } : h)));
  const setHabitFrequency = (id: string, f: "Daily" | "Weekly") =>
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, frequency: f } : h)));

  const visibleHabits = habits.filter((h) => activeCategories.includes(h.category));
  const current = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;
  const qc = useQueryClient();
// ...


  const handleNext = async () => {
    if (isLast) {
      if ((current as any).isStarter) {
        const payload = visibleHabits.filter(h => h.selected).map(h => ({
          title: h.title, category: h.category, icon: h.icon, frequency: h.frequency,
        }));
        if (payload.length) {
          try {
            setBulkSaving(true);
            await api.post("habits/bulk", { json: { habits: payload } });
            await qc.invalidateQueries({ queryKey: ["habits", "mine"] });
          } catch {}
          finally { setBulkSaving(false); }
        }
      }
      onComplete();
    } else setCurrentStep(s => s + 1);
  };

  const handlePrev = () => !isFirst && setCurrentStep(s => s - 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onComplete} />

      <div className={cn(
        "relative flex flex-col max-h-[90vh] w-full max-w-lg rounded-2xl shadow-2xl p-8 border overflow-y-auto",
        isDark ? "bg-slate-800 border-slate-700" : "bg-white border-green-200"
      )}>
        <button
          onClick={onComplete}
          className={cn("absolute top-4 right-4",
            isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"
          )}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h3 className={cn("mb-2", isDark ? "text-white" : "text-gray-900")}>{current.title}</h3>
          <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>{current.description}</p>
        </div>

        {(current as any).isStarter && (
          <StarterPicker
            theme={theme}
            active={activeCategories}
            toggle={toggleCategory}
            items={visibleHabits}
            setSel={setHabitSelected}
            setFreq={setHabitFrequency}
          />
        )}

        <div className="flex items-center justify-between mt-8">
          <Button
            onClick={handlePrev}
            disabled={isFirst}
            variant="outline"
            className={cn("rounded-xl",
              isDark ? "border-slate-600 text-gray-300 hover:bg-slate-700" : ""
            )}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={bulkSaving}
            className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            {isLast ? (bulkSaving ? "Creating…" : "Let's Go!") : "Next"}
            {!isLast && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- StarterPicker ---------------- */
function StarterPicker({
  theme,
  active,
  toggle,
  items,
  setSel,
  setFreq,
}: {
  theme: "day" | "night";
  active: StarterHabit["category"][];
  toggle: (c: StarterHabit["category"]) => void;
  items: StarterHabit[];
  setSel: (id: string, s: boolean) => void;
  setFreq: (id: string, f: "Daily" | "Weekly") => void;
}) {
  const isDark = theme === "night";
  const CATS: { id: StarterHabit["category"]; label: string; icon: any }[] = [
    { id: "Health", label: "Health", icon: Heart },
    { id: "Eco", label: "Eco", icon: Leaf },
    { id: "Productivity", label: "Productivity", icon: Briefcase },
    { id: "Relationships", label: "Relationships", icon: Users },
  ];

  return (
    <div className="space-y-5">
      {/* Kategorie */}
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

      {/* Jednosloupcový seznam všech aktivních habits */}
      <div className="grid grid-cols-1 gap-4">
        {active.flatMap((cat) =>
          SUGGESTED[cat].map((h) => {
            const Icon = ICONS[h.icon];
            const item = items.find((x) => x.id === h.id);
            const selected = item?.selected ?? false;
            const frequency = item?.frequency ?? h.frequency;

            return (
              <div
                key={h.id}
                className={cn(
                  "relative flex flex-col justify-between p-5 rounded-xl border transition-all duration-200 overflow-visible",
                  selected
                    ? "border-emerald-500 ring-1 ring-emerald-200/60 bg-emerald-50/10"
                    : isDark
                    ? "border-slate-600 hover:bg-slate-700"
                    : "border-gray-200 hover:bg-gray-50"
                )}
              >
                {/* Selected chip */}
                <button
                  onClick={() => setSel(h.id, !selected)}
                  className={cn(
                    "absolute top-3 right-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border transition-colors",
                    selected
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : isDark
                      ? "border-slate-600 text-slate-200 hover:bg-slate-700"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {selected && <Check className="w-3.5 h-3.5" />}
                  {selected ? "Selected" : "Select"}
                </button>

                {/* Horní část */}
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

                {/* Select */}
                <div className="mt-4">
                  <Select
                    value={frequency}
                    onValueChange={(v) => setFreq(h.id, v as "Daily" | "Weekly")}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-10 rounded-md text-sm w-full",
                        isDark
                          ? "bg-slate-700 border-slate-600 text-white"
                          : ""
                      )}
                    >
                      <SelectValue placeholder="Frequency" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className={cn(
                        "z-[60]",
                        isDark
                          ? "bg-slate-700 border-slate-600 text-white"
                          : ""
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
