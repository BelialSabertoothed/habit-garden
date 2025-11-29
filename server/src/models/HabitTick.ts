import mongoose, { Schema, model } from "mongoose";

const HabitTickSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    habitId: { type: Schema.Types.ObjectId, ref: "Habit", index: true, required: true },
    frequency: { type: String, enum: ["Daily", "Weekly"], required: true },
    dayKey: { type: String, index: true }, 
    weekKey: { type: String, index: true }, 
  },
  { timestamps: true }
);

HabitTickSchema.index(
  { userId: 1, habitId: 1, dayKey: 1 },
  { unique: true, partialFilterExpression: { frequency: "Daily" } }
);

HabitTickSchema.index(
  { userId: 1, habitId: 1, weekKey: 1 },
  { unique: true, partialFilterExpression: { frequency: "Weekly" } }
);

HabitTickSchema.index({ userId: 1, dayKey: 1 });

export const HabitTick =
  mongoose.models.HabitTick || model("HabitTick", HabitTickSchema);