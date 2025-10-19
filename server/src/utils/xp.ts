export const XP_DAILY = 10;
export const XP_WEEKLY = 15;

export const calcAward = (frequency: "daily"|"weekly") =>
  frequency === "daily" ? XP_DAILY : XP_WEEKLY;

export const levelFromXp = (xp: number) =>
  Math.floor(xp / 100) + 1;
