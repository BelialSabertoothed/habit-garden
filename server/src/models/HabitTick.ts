import mongoose, { Schema, model } from "mongoose";

const HabitTickSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    habitId: { type: Schema.Types.ObjectId, ref: "Habit", index: true, required: true },
    frequency: { type: String, enum: ["Daily", "Weekly"], required: true },
    dayKey: { type: String, index: true },  // např. "2025-11-12"
    weekKey: { type: String, index: true }, // např. "2025-W46"
  },
  { timestamps: true }
);

export const HabitTick =
  mongoose.models.HabitTick || model("HabitTick", HabitTickSchema);
