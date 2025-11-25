import { useState } from "react";
import { Heart, Leaf, Briefcase, Users, Palette, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useCreateHabit } from "../hooks/useCreateHabit";
import {
  SUGGESTED_HABITS_BY_CATEGORY,
  type SuggestedHabit,
  type SuggestedCategory,
} from "../data/suggestedHabits";
import type { Habit } from "../hooks/useHabits";
import { useTranslation } from "react-i18next";

interface AddHabitModalProps {
  open: boolean;
  onClose: () => void;
  theme: "day" | "night";
}

// typy zarovnané s BE
type Frequency = "Daily" | "Weekly";
type HabitCategory = Habit["category"]; // "Health" | "Eco" | "Productivity" | "Relationships" | "Creativity" | "Custom"
type HabitIconId = Habit["icon"]; // "heart" | "leaf" | "briefcase" | "users" | "palette"

// ikony, které můžeš vybrat (hlavně pro Custom)
const icons: { id: HabitIconId; icon: any; label: string }[] = [
  { id: "heart", icon: Heart, label: "Health" },
  { id: "leaf", icon: Leaf, label: "Eco" },
  { id: "briefcase", icon: Briefcase, label: "Productivity" },
  { id: "users", icon: Users, label: "Relationships" },
  { id: "palette", icon: Palette, label: "Creativity" },
];

// BE kategorie (včetně Custom)
const predefinedCategories: HabitCategory[] = [
  "Health",
  "Eco",
  "Productivity",
  "Relationships",
  "Creativity",
  "Custom",
];

// mapování kategorie → default ikona (pro ne-Custom)
const ICON_BY_CATEGORY: Record<
  Exclude<HabitCategory, "Custom">,
  HabitIconId
> = {
  Health: "heart",
  Eco: "leaf",
  Productivity: "briefcase",
  Relationships: "users",
  Creativity: "palette",
};

// pro inspirační panel (Health, Eco, …)
type SuggestCategory = SuggestedCategory;

export function AddHabitModal({ open, onClose, theme }: AddHabitModalProps) {
  const isDark = theme === "night";
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<HabitIconId>("heart");
  const [selectedCategory, setSelectedCategory] =
    useState<HabitCategory>("Health");
  const [frequency, setFrequency] = useState<Frequency>("Daily");

  // inspo panel
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestCategory, setSuggestCategory] =
    useState<SuggestCategory>("Health");

  const createHabit = useCreateHabit();

  function randomWorth(freq: Frequency) {
    if (freq === "Daily") {
      const options = [10, 15, 20, 25];
      return options[Math.floor(Math.random() * options.length)];
    } else {
      const options = [15, 20, 25, 30, 35];
      return options[Math.floor(Math.random() * options.length)];
    }
  }

  function handleSubmit() {
    const category = selectedCategory;

    if (!title.trim() || !category) return;

    // rozhodnutí, jakou ikonu pošleme na BE
    let iconToSend: HabitIconId;

    if (category === "Custom") {
      // Custom → použij uživatelem vybranou ikonku
      iconToSend = selectedIcon ?? "leaf";
    } else {
      // standardní kategorie → default podle kategorie
      iconToSend =
        ICON_BY_CATEGORY[category as Exclude<HabitCategory, "Custom">];
    }

    createHabit.mutate(
      {
        title: title.trim(),
        category,
        icon: iconToSend,
        frequency,
        worth: randomWorth(frequency),
      },
      {
        onSuccess: () => {
          setTitle("");
          setSelectedCategory("Health");
          setSelectedIcon("heart");
          setFrequency("Daily");
          onClose();
        },
      }
    );
  }

  const suggestions: SuggestedHabit[] =
    SUGGESTED_HABITS_BY_CATEGORY[suggestCategory];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto scrollbar-soft bg-white/95 backdrop-blur-sm border-green-200 rounded-3xl">
        <DialogHeader>
          <DialogTitle className={isDark ? "text-white" : ""}>
            {t("habits.addModal.title")}
          </DialogTitle>
          <DialogDescription className={isDark ? "text-gray-400" : ""}>
            {t("habits.addModal.description")}
          </DialogDescription>
        </DialogHeader>

        {/* scrollovatelný obsah */}
        <div className="flex-1 overflow-y-auto space-y-5 py-4 pr-1">
          {/* TITLE */}
          <div className="space-y-2">
            <Label
              htmlFor="habit-name"
              className={isDark ? "text-gray-300" : ""}
            >
              {t("habits.addModal.field.name.label")}
            </Label>
            <Input
              id="habit-name"
              placeholder={t("habits.addModal.field.name.placeholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`rounded-lg ${
                isDark
                  ? "bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                  : "bg-gray-50 border border-gray-300 text-gray-900 placeholder:text-gray-400"
              }`}
            />
          </div>

          {/* CATEGORY */}
          <div className="space-y-2">
            <Label className={isDark ? "text-gray-300" : ""}>
              {t("habits.addModal.field.category.label")}
            </Label>
            <Select
              value={selectedCategory}
              onValueChange={(v) => setSelectedCategory(v as HabitCategory)}
            >
              <SelectTrigger
                className={`rounded-lg ${
                  isDark
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-gray-50 border border-gray-300 text-gray-900"
                }`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className={`rounded-lg ${
                  isDark
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border border-gray-300 text-gray-900"
                }`}
              >
                {predefinedCategories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {t(`habits.categories.${c}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* FREQUENCY */}
          <div className="space-y-2">
            <Label className={isDark ? "text-gray-300" : ""}>
              {t("habits.addModal.field.frequency.label")}
            </Label>
            <Select
              value={frequency}
              onValueChange={(v) => setFrequency(v as Frequency)}
            >
              <SelectTrigger
                className={`rounded-lg ${
                  isDark
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-gray-50 border border-gray-300 text-gray-900"
                }`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className={`rounded-lg ${
                  isDark
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border border-gray-300 text-gray-900"
                }`}
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

          {/* ICON – jen pro Custom */}
          {selectedCategory === "Custom" && (
            <div className="space-y-2">
              <Label className={isDark ? "text-gray-300" : ""}>
                {t("habits.addModal.field.icon.label")}
              </Label>
              <div className="grid grid-cols-5 gap-3">
                {icons.map((item) => {
                  const Icon = item.icon;
                  const active = selectedIcon === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setSelectedIcon(item.id)}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 
                        ${
                          active
                            ? "border-green-500 bg-green-50"
                            : isDark
                            ? "border-slate-600 bg-slate-700 hover:border-slate-500"
                            : "border-gray-200 bg-gray-50 hover:border-gray-300"
                        }`}
                    >
                      <Icon
                        className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto ${
                          active
                            ? "text-green-600"
                            : isDark
                            ? "text-gray-400"
                            : "text-gray-600"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* INSPIRATION TOGGLE + LIST */}
          <div className="pt-2 border-t border-slate-700/40 mt-2">
            <button
              type="button"
              onClick={() => setShowSuggestions((s) => !s)}
              className={`w-full inline-flex items-center justify-center gap-2 text-sm rounded-full px-3 py-2 mt-1
                ${
                  isDark
                    ? "bg-slate-700 hover:bg-slate-600 text-gray-200"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
            >
              <Sparkles className="w-4 h-4" />
              {showSuggestions
                ? t("habits.addModal.inspiration.hide")
                : t("habits.addModal.inspiration.show")}
            </button>

            {showSuggestions && (
              <div className="mt-3 space-y-3">
                {/* category pills */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {(
                    [
                      "Health",
                      "Eco",
                      "Productivity",
                      "Relationships",
                      "Creativity",
                    ] as SuggestCategory[]
                  ).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSuggestCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-xs border
                        ${
                          suggestCategory === cat
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : isDark
                            ? "border-slate-600 text-slate-200 hover:bg-slate-700"
                            : "border-gray-200 text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      {t(`habits.categories.${cat}`)}
                    </button>
                  ))}
                </div>

                {/* suggestion cards */}
                <div className="space-y-2 max-h-52 overflow-y-auto -mx-1 px-1">
                  {suggestions.map((h) => {
                    const Icon = icons.find((i) => i.id === h.icon)?.icon;
                    const localizedTitle = t(h.titleKey);
                    const active = title === localizedTitle;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => {
                          setTitle(localizedTitle);
                          setSelectedCategory(h.category as HabitCategory);
                          setSelectedIcon(h.icon as HabitIconId);
                          setFrequency(h.frequency as Frequency);
                        }}
                        className={`w-full flex items-start gap-3 p-2.5 rounded-xl border text-left text-sm transition-colors
                          ${
                            active
                              ? "border-emerald-500 bg-emerald-50/70"
                              : isDark
                              ? "border-slate-600 bg-slate-700 hover:bg-slate-600"
                              : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                          }`}
                      >
                        {Icon && (
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                              ${isDark ? "bg-slate-800" : "bg-white"}`}
                          >
                            <Icon
                              className={
                                isDark
                                  ? "w-4 h-4 text-emerald-300"
                                  : "w-4 h-4 text-emerald-600"
                              }
                            />
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span
                            className={
                              isDark
                                ? "text-gray-50 text-sm"
                                : "text-gray-900 text-sm"
                            }
                          >
                            {localizedTitle}
                          </span>
                          <span
                            className={`text-[11px] mt-0.5 ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {t(`habits.categories.${h.category}`)} •{" "}
                            {t(`habits.frequency.${h.frequency}`)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER – zůstává viditelný, ne-scrolluje */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className={`flex-1 rounded-full ${
              isDark
                ? "border-slate-500 bg-slate-800 text-gray-200 hover:bg-slate-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {t("habits.addModal.actions.cancel")}
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={createHabit.isPending}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full"
          >
            {createHabit.isPending
              ? t("habits.addModal.actions.creating")
              : t("habits.addModal.actions.create")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
