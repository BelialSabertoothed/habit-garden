import mongoose, { Schema, model, Types } from "mongoose";

const HabitSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["health", "eco", "productivity", "relationships", "custom"],
      default: "custom",
    },
    frequency: { type: String, enum: ["daily", "weekly"], required: true },
    icon: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Habit = mongoose.models.Habit || model("Habit", HabitSchema);
