
export type SuggestedCategory =
  | "Health"
  | "Eco"
  | "Productivity"
  | "Relationships"
  | "Creativity";

export type SuggestedFrequency = "Daily" | "Weekly";

export type SuggestedHabit = {
  id: string;
  title: string;
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