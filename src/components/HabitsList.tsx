import { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Pencil,
  Trash2,
  AlertTriangle,
  Heart,
  Leaf,
  Briefcase,
  Users,
  Palette,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { HabitCard } from "./HabitCard";
import { AddHabitModal } from "./AddHabitModal";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useHabits, useUpdateHabit, useDeleteHabit } from "../hooks/useHabits";
import type { Habit } from "../hooks/useHabits";
import { useTranslation } from "react-i18next";

interface HabitsListProps {
  theme: "day" | "night";
}

// FE kategorie (All + BE enum + Custom bucket)
type Category = "All" | Habit["category"];

// align s BE
type HabitItem = {
  _id: string;
  title: string;
  category: string;
  frequency: "Daily" | "Weekly";
  iconId?: Habit["icon"]; // ← z BE
};

// základní BE kategorie – bez "Custom"
const BASE_CATEGORIES: Habit["category"][] = [
  "Health",
  "Eco",
  "Productivity",
  "Relationships",
  "Creativity",
];

const icons: { id: Habit["icon"]; icon: typeof Heart; label: string }[] = [
  { id: "heart", icon: Heart, label: "Health" },
  { id: "leaf", icon: Leaf, label: "Eco" },
  { id: "briefcase", icon: Briefcase, label: "Productivity" },
  { id: "users", icon: Users, label: "Relationships" },
  { id: "palette", icon: Palette, label: "Creativity" },
];

export function HabitsList({ theme }: HabitsListProps) {
  const isDark = theme === "night";
  const { t } = useTranslation();

  const { data: habits = [], isLoading, isError } = useHabits();
  const deleteHabit = useDeleteHabit();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitItem | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<HabitItem | null>(null);

  const categories: Category[] = [
    "All",
    ...BASE_CATEGORIES,
    "Custom", // bucket pro všechno ostatní
  ];

  const filteredHabits = (habits as HabitItem[]).filter((habit) => {
    const matchesSearch = habit.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    let matchesCategory = true;

    if (selectedCategory !== "All") {
      if (selectedCategory === "Custom") {
        // Custom = všechny kategorie, které nejsou mezi základními
        matchesCategory = !BASE_CATEGORIES.includes(
          habit.category as Habit["category"]
        );
      } else {
        matchesCategory = habit.category === selectedCategory;
      }
    }

    return matchesSearch && matchesCategory;
  });

  const handleDeleteConfirm = () => {
    if (!habitToDelete) return;
    deleteHabit.mutate(habitToDelete._id, {
      onSuccess: () => {
        setHabitToDelete(null);
      },
    });
  };

  const getCategoryLabel = (category: Category) => {
    if (category === "All") return t("habits.list.filters.all");
    if (category === "Custom") return t("habits.categories.Custom");
    return t(`habits.categories.${category}`);
  };

  if (isLoading) {
    return (
      <div
        className={`py-10 text-center ${
          isDark ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {t("habits.list.loading")}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-10 text-center text-red-500">
        {t("habits.list.error")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className={isDark ? "text-white" : "text-gray-900"}>
            {t("habits.list.title")}
          </h2>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            {t("habits.list.subtitle")}
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full shadow-md"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t("habits.list.actions.add")}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
              isDark ? "text-gray-400" : "text-gray-400"
            }`}
          />
          <Input
            placeholder={t("habits.list.search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-12 rounded-full ${
              isDark
                ? "bg-slate-800 border-slate-700 text-white placeholder:text-gray-400"
                : "bg-white"
            }`}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Filter
              className={`w-5 h-5 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <span
              className={`text-xs uppercase tracking-wide ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {t("habits.list.filters.categoryLabel")}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`
                  cursor-pointer rounded-full px-4 py-1.5 transition-all duration-200 text-sm
                  ${
                    selectedCategory === category
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : isDark
                      ? "border-slate-600 text-gray-300 hover:bg-slate-700"
                      : "hover:bg-gray-100"
                  }
                `}
              >
                {getCategoryLabel(category)}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Habits Grid */}
      {filteredHabits.length === 0 ? (
        <div
          className={`text-center py-12 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>{t("habits.list.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredHabits.map((habit: HabitItem) => (
              <motion.div
                key={habit._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16 }}
                className="relative"
              >
                {/* Overlay actions */}
                <div className="absolute top-3 right-3 z-20 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingHabit(habit)}
                    className={`p-1.5 rounded-full border text-xs transition-colors ${
                      isDark
                        ? "bg-slate-800/80 border-slate-600 text-gray-200 hover:bg-slate-700"
                        : "bg-white/90 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setHabitToDelete(habit)}
                    className={`p-1.5 rounded-full border text-xs transition-colors ${
                      isDark
                        ? "bg-slate-800/80 border-red-500/40 text-red-300 hover:bg-red-900/40"
                        : "bg-white/90 border-red-200 text-red-600 hover:bg-red-50"
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Card itself */}
                <HabitCard
                  name={habit.title}
                  category={
                    (habit.category as Habit["category"]) ?? "Custom"
                  }
                  frequency={habit.frequency}
                  theme={theme}
                  iconId={habit.iconId}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create */}
      <AddHabitModal
        open={showModal}
        onClose={() => setShowModal(false)}
        theme={theme}
      />

      {/* Edit */}
      {editingHabit && (
        <EditHabitModal
          open={!!editingHabit}
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
          theme={theme}
        />
      )}

      {/* Delete confirm */}
      <DeleteHabitDialog
        open={!!habitToDelete}
        theme={theme}
        habitName={habitToDelete?.title ?? ""}
        loading={deleteHabit.isPending}
        onCancel={() => {
          if (!deleteHabit.isPending) setHabitToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

/* -------------------------- EditHabitModal -------------------------- */

function EditHabitModal({
  open,
  habit,
  onClose,
  theme,
}: {
  open: boolean;
  habit: HabitItem;
  onClose: () => void;
  theme: "day" | "night";
}) {
  const isDark = theme === "night";
  const updateHabit = useUpdateHabit();
  const { t } = useTranslation();

  const [title, setTitle] = useState(habit.title);
  const [category, setCategory] = useState<string>(habit.category);
  const [selectedIcon, setSelectedIcon] = useState(habit.iconId); // ← z BE
  const [frequency, setFrequency] = useState<"Daily" | "Weekly">(
    habit.frequency
  );

  const predefinedCategories: Habit["category"][] = [
    ...BASE_CATEGORIES,
    "Custom",
  ];

  const isPredefined = BASE_CATEGORIES.includes(
    category as Habit["category"]
  );
  const isCustomCategory = category === "Custom";

  const handleSave = () => {
    const cleanTitle = title.trim();
    const cleanCategory = category.trim();

    if (!cleanTitle || !cleanCategory) return;

    const payload: Partial<
      Pick<Habit, "title" | "category" | "frequency" | "icon">
    > = {
      title: cleanTitle,
      frequency,
      category: cleanCategory as Habit["category"],
    };

    // icon posíláme JEN u Custom
    if (cleanCategory === "Custom") {
      payload.icon = (selectedIcon as Habit["icon"]) ?? "leaf";
    }

    updateHabit.mutate(
      {
        id: habit._id,
        payload,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    if (!updateHabit.isPending) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={`${
          isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white"
        } rounded-2xl max-w-md w-[95vw] sm:w-full`}
      >
        <DialogHeader>
          <DialogTitle className={isDark ? "text-white" : ""}>
            {t("habits.edit.title")}
          </DialogTitle>
          <DialogDescription className={isDark ? "text-gray-400" : ""}>
            {t("habits.edit.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* TITLE */}
          <div className="space-y-2">
            <Label
              htmlFor="edit-habit-name"
              className={isDark ? "text-gray-300" : ""}
            >
              {t("habits.edit.fields.name.label")}
            </Label>
            <Input
              id="edit-habit-name"
              placeholder={t("habits.edit.fields.name.placeholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`rounded-lg ${
                isDark
                  ? "bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                  : ""
              }`}
            />
          </div>

          {/* CATEGORY */}
          <div className="space-y-2">
            <Label className={isDark ? "text-gray-300" : ""}>
              {t("habits.edit.fields.category.label")}
            </Label>
            <Select
              value={isPredefined ? (category as Habit["category"]) : "Custom"}
              onValueChange={(v) => {
                setCategory(v);
              }}
            >
              <SelectTrigger
                className={`rounded-lg ${
                  isDark ? "bg-slate-700 border-slate-600 text-white" : ""
                }`}
              >
                <SelectValue
                  placeholder={
                    isPredefined
                      ? t(`habits.categories.${category}`)
                      : t("habits.edit.fields.category.customPlaceholder")
                  }
                />
              </SelectTrigger>
              <SelectContent
                className={
                  isDark ? "bg-slate-700 border-slate-600 text-white" : ""
                }
              >
                {predefinedCategories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {t(`habits.categories.${c}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ICON – jen když je Custom */}
          {isCustomCategory && (
            <div className="space-y-2">
              <Label className={isDark ? "text-gray-300" : ""}>
                {t("habits.edit.fields.icon.label")}
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

          {/* FREQUENCY */}
          <div className="space-y-2">
            <Label className={isDark ? "text-gray-300" : ""}>
              {t("habits.edit.fields.frequency.label")}
            </Label>
            <Select
              value={frequency}
              onValueChange={(v) => setFrequency(v as "Daily" | "Weekly")}
            >
              <SelectTrigger
                className={`rounded-lg ${
                  isDark ? "bg-slate-700 border-slate-600 text-white" : ""
                }`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className={
                  isDark ? "bg-slate-700 border-slate-600 text-white" : ""
                }
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

        {/* FOOTER */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={updateHabit.isPending}
            className={`flex-1 rounded-full ${
              isDark
                ? "border-slate-500 bg-slate-800 text-gray-200 hover:bg-slate-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {t("habits.edit.actions.cancel")}
          </Button>

          <Button
            onClick={handleSave}
            disabled={updateHabit.isPending}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full"
          >
            {updateHabit.isPending
              ? t("habits.edit.actions.saving")
              : t("habits.edit.actions.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------- DeleteHabitDialog -------------------------- */

function DeleteHabitDialog({
  open,
  theme,
  habitName,
  loading,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  theme: "day" | "night";
  habitName: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isDark = theme === "night";
  const { t } = useTranslation();

  const handleChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleChange}>
      <DialogContent
        className={`${
          isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white"
        } rounded-2xl max-w-sm w-[95vw]`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={isDark ? "text-red-300" : "text-red-600"}>
              <AlertTriangle className="w-5 h-5" />
            </span>
            <span className={isDark ? "text-white" : ""}>
              {t("habits.delete.title")}
            </span>
          </DialogTitle>
          <DialogDescription
            className={isDark ? "text-gray-400" : "text-gray-600"}
          >
            {t("habits.delete.confirmPrefix")}{" "}
            <span className="font-semibold">
              {habitName || t("habits.delete.defaultName")}
            </span>
            ?{" "}
            {t("habits.delete.warning")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className={`flex-1 rounded-full ${
              isDark
                ? "border-slate-500 bg-slate-800 text-gray-200 hover:bg-slate-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {t("habits.delete.actions.cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white"
          >
            {loading
              ? t("habits.delete.actions.deleting")
              : t("habits.delete.actions.delete")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
