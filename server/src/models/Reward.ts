import mongoose, { Schema, model, Types } from "mongoose";
import { BADGE_IDS, type BadgeId } from "../utils/badgesRules.js";

const RewardSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    badge: {
      type: String,
      enum: BADGE_IDS, // ✅ stejné hodnoty jako FE/BE badge config
      required: true,
    },
    earnedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

RewardSchema.index({ userId: 1, badge: 1 }, { unique: true });

export type RewardDoc = mongoose.Document & {
  userId: typeof Types.ObjectId;
  badge: BadgeId;
  earnedAt: Date;
};

export const Reward =
  mongoose.models.Reward || model<RewardDoc>("Reward", RewardSchema);