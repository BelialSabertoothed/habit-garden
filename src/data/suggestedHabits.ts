export type SuggestedCategory =
  | "Health"
  | "Eco"
  | "Productivity"
  | "Relationships"
  | "Creativity";

export type SuggestedFrequency = "Daily" | "Weekly";

export type SuggestedHabit = {
  id: string;
  titleKey: string; // i18n klíč na titulek
  title: string; // defaultní EN text (např. pro BE)
  category: SuggestedCategory;
  icon: "heart" | "leaf" | "briefcase" | "users" | "palette";
  frequency: SuggestedFrequency;
  worth?: number;
};

export const SUGGESTED_HABITS_BY_CATEGORY: Record<
  SuggestedCategory,
  SuggestedHabit[]
> = {
  Health: [
    {
      id: "h1",
      titleKey: "habits.suggestions.h1.title",
      title: "Drink 8 glasses of water",
      category: "Health",
      icon: "heart",
      frequency: "Daily",
      worth: 20,
    },
    {
      id: "h2",
      titleKey: "habits.suggestions.h2.title",
      title: "Sleep 7–8 hours",
      category: "Health",
      icon: "heart",
      frequency: "Daily",
      worth: 25,
    },
    {
      id: "h3",
      titleKey: "habits.suggestions.h3.title",
      title: "Stretch or move for 10 minutes",
      category: "Health",
      icon: "heart",
      frequency: "Daily",
      worth: 15,
    },
    {
      id: "h4",
      titleKey: "habits.suggestions.h4.title",
      title: "Go for a walk outdoors",
      category: "Health",
      icon: "heart",
      frequency: "Daily",
      worth: 20,
    },
    {
      id: "h5",
      titleKey: "habits.suggestions.h5.title",
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
      titleKey: "habits.suggestions.p1.title",
      title: "Plan 3 priorities for the day",
      category: "Productivity",
      icon: "briefcase",
      frequency: "Daily",
      worth: 20,
    },
    {
      id: "p2",
      titleKey: "habits.suggestions.p2.title",
      title: "Focus 25 minutes (Pomodoro)",
      category: "Productivity",
      icon: "briefcase",
      frequency: "Daily",
      worth: 15,
    },
    {
      id: "p3",
      titleKey: "habits.suggestions.p3.title",
      title: "Check off one postponed task",
      category: "Productivity",
      icon: "briefcase",
      frequency: "Daily",
      worth: 20,
    },
    {
      id: "p4",
      titleKey: "habits.suggestions.p4.title",
      title: "Organize workspace",
      category: "Productivity",
      icon: "briefcase",
      frequency: "Weekly",
      worth: 30,
    },
    {
      id: "p5",
      titleKey: "habits.suggestions.p5.title",
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
      titleKey: "habits.suggestions.r1.title",
      title: "Send a kind message",
      category: "Relationships",
      icon: "users",
      frequency: "Daily",
      worth: 15,
    },
    {
      id: "r2",
      titleKey: "habits.suggestions.r2.title",
      title: "Call or visit family",
      category: "Relationships",
      icon: "users",
      frequency: "Weekly",
      worth: 40,
    },
    {
      id: "r3",
      titleKey: "habits.suggestions.r3.title",
      title: "Compliment someone",
      category: "Relationships",
      icon: "users",
      frequency: "Daily",
      worth: 10,
    },
    {
      id: "r4",
      titleKey: "habits.suggestions.r4.title",
      title: "Meet a friend offline",
      category: "Relationships",
      icon: "users",
      frequency: "Weekly",
      worth: 30,
    },
    {
      id: "r5",
      titleKey: "habits.suggestions.r5.title",
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
      titleKey: "habits.suggestions.e1.title",
      title: "Sort your recycling",
      category: "Eco",
      icon: "leaf",
      frequency: "Weekly",
      worth: 20,
    },
    {
      id: "e2",
      titleKey: "habits.suggestions.e2.title",
      title: "Bring your own bottle/cup",
      category: "Eco",
      icon: "leaf",
      frequency: "Daily",
      worth: 15,
    },
    {
      id: "e3",
      titleKey: "habits.suggestions.e3.title",
      title: "Turn off unused lights",
      category: "Eco",
      icon: "leaf",
      frequency: "Daily",
      worth: 20,
    },
    {
      id: "e4",
      titleKey: "habits.suggestions.e4.title",
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
      titleKey: "habits.suggestions.c1.title",
      title: "Sketch or doodle for 10 minutes",
      category: "Creativity",
      icon: "palette",
      frequency: "Daily",
      worth: 25,
    },
    {
      id: "c2",
      titleKey: "habits.suggestions.c2.title",
      title: "Write a short journal entry",
      category: "Creativity",
      icon: "palette",
      frequency: "Daily",
      worth: 20,
    },
    {
      id: "c3",
      titleKey: "habits.suggestions.c3.title",
      title: "Take an inspiring photo",
      category: "Creativity",
      icon: "palette",
      frequency: "Daily",
      worth: 15,
    },
    {
      id: "c4",
      titleKey: "habits.suggestions.c4.title",
      title: "Work on a creative hobby",
      category: "Creativity",
      icon: "palette",
      frequency: "Weekly",
      worth: 40,
    },
    {
      id: "c5",
      titleKey: "habits.suggestions.c5.title",
      title: "Consume something inspiring",
      category: "Creativity",
      icon: "palette",
      frequency: "Daily",
      worth: 20,
    },
  ],
};
