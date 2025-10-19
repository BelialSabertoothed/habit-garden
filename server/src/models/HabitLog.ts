import mongoose, { Schema, model, Types } from "mongoose";

const HabitLogSchema = new Schema({
  habitId: { type: Types.ObjectId, ref: "Habit", required: true },
  userId:  { type: Types.ObjectId, ref: "User", required: true, index: true },
  date:    { type: String, required: true }, // YYYY-MM-DD
  completed: { type: Boolean, default: true }
}, { timestamps: true });

HabitLogSchema.index({ habitId: 1, date: 1 }, { unique: true }); // 1 log/den/habit

export const HabitLog = mongoose.models.HabitLog || model("HabitLog", HabitLogSchema);
