export type User = {
  id: string;
  email: string;
  nickname?: string;
  avatar?: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  theme: "day" | "night";
  profileComplete: boolean;
  onboardingDone: boolean;
  experimentVariant: "gamified" | "control" | undefined;
};


export type Habit = {
  id: string;         
  title: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  streak?: number;
  archived?: boolean;
};

export type CreateHabitDto = { title: string; notes?: string; };
export type UpdateHabitDto = Partial<CreateHabitDto> & { archived?: boolean };
