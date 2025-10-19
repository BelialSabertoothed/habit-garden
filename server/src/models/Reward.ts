import mongoose, { Schema, model, Types } from "mongoose";
const RewardSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true },
  badge:  { type: String, required: true },
  earnedAt: { type: Date, default: () => new Date() }
}, { timestamps: true });
RewardSchema.index({ userId: 1, badge: 1 }, { unique: true });
export const Reward = mongoose.models.Reward || model("Reward", RewardSchema);
