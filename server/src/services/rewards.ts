// src/services/rewards.ts
import { Reward } from "../models/Reward.js";
import {
  BADGE_RULES,
  type UserLike,
  type BadgeId,
} from "../utils/badgesRules.js";

export async function awardRewardIfMissing(userId: string, badge: BadgeId) {
  try {
    const created = await Reward.create({ userId, badge });
    return created;
  } catch (err: any) {
    // 11000 = duplicitní index userId+badge
    if (err?.code === 11000) {
      const existing = await Reward.findOne({ userId, badge });
      return existing;
    }
    throw err;
  }
}

export async function awardBadgesForUser(user: UserLike) {
  if (!user?._id) return;

  const userId = String(user._id);

  for (const rule of BADGE_RULES) {
    if (!rule.check(user)) continue;
    await awardRewardIfMissing(userId, rule.id);
  }
}