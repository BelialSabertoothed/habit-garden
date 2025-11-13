import { useState } from "react";
import { Heart, Leaf, Briefcase, Users, Palette } from "lucide-react";
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

interface AddHabitModalProps {
  open: boolean;
  onClose: () => void;
  theme: "day" | "night";
}

const icons = [
  { id: "heart", icon: Heart, label: "Health" },
  { id: "leaf", icon: Leaf, label: "Eco" },
  { id: "briefcase", icon: Briefcase, label: "Productivity" },
  { id: "users", icon: Users, label: "Relationships" },
  { id: "palette", icon: Palette, label: "Creativity" },
];

const predefinedCategories = [
  "Health",
  "Eco",
  "Productivity",
  "Relationships",
  "Creativity",
  "Custom",
];

export function AddHabitModal({ open, onClose, theme }: AddHabitModalProps) {
  const isDark = theme === "night";

  const [title, setTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("heart");
  const [selectedCategory, setSelectedCategory] = useState("Health");
  const [customCategory, setCustomCategory] = useState("");
  const [frequency, setFrequency] = useState<"Daily" | "Weekly">("Daily");

  const isCustom = selectedCategory === "Custom";

  const createHabit = useCreateHabit();

  function randomWorth(freq: "Daily" | "Weekly") {
    if (freq === "Daily") {
      const options = [10, 15, 20, 25];
      return options[Math.floor(Math.random() * options.length)];
    } else {
      const options = [15, 20, 25, 30, 35];
      return options[Math.floor(Math.random() * options.length)];
    }
  }

  function handleSubmit() {
    const category = isCustom ? customCategory.trim() : selectedCategory;

    if (!title.trim() || !category) return;

    createHabit.mutate(
      {
        title,
        category,
        icon: selectedIcon as any,
        frequency,
        worth: randomWorth(frequency),
      },
      {
        onSuccess: () => {
          setTitle("");
          setCustomCategory("");
          setSelectedCategory("Health");
          onClose();
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`${
          isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white"
        } rounded-2xl max-w-md`}
      >
        <DialogHeader>
          <DialogTitle className={isDark ? "text-white" : ""}>
            Add Custom Habit
          </DialogTitle>
          <DialogDescription className={isDark ? "text-gray-400" : ""}>
            Create a new habit to add to your garden.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* TITLE */}
          <div className="space-y-2">
            <Label
              htmlFor="habit-name"
              className={isDark ? "text-gray-300" : ""}
            >
              Habit Name
            </Label>
            <Input
              id="habit-name"
              placeholder="e.g., Morning yoga"
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
            <Label className={isDark ? "text-gray-300" : ""}>Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
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
                {predefinedCategories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isCustom && (
              <Input
                placeholder="Enter custom category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className={`rounded-lg ${
                  isDark
                    ? "bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                    : ""
                }`}
              />
            )}
          </div>

          {/* FREQUENCY */}
          <div className="space-y-2">
            <Label className={isDark ? "text-gray-300" : ""}>Frequency</Label>
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
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ICON */}
          <div className="space-y-2">
            <Label className={isDark ? "text-gray-300" : ""}>Icon</Label>
            <div className="grid grid-cols-5 gap-3">
              {icons.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setSelectedIcon(item.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 
                      ${
                        selectedIcon === item.id
                          ? "border-green-500 bg-green-50"
                          : isDark
                          ? "border-slate-600 bg-slate-700 hover:border-slate-500"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                  >
                    <Icon
                      className={`w-6 h-6 mx-auto ${
                        selectedIcon === item.id
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
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className={`flex-1 rounded-full ${
              isDark ? "border-slate-600 text-gray-300 hover:bg-slate-700" : ""
            }`}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={createHabit.isPending}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full"
          >
            {createHabit.isPending ? "Creating…" : "Create Habit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
