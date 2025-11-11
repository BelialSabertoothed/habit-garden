import mongoose, { Schema, model } from "mongoose";

// models/Habit.ts (ukázka klíčových polí)
const HabitSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, index: true, required: true },
  title: String,
  category: { type: String, enum: ["Health","Eco","Productivity","Relationships"] },
  icon: { type: String, enum: ["heart","leaf","briefcase","users"] },
  frequency: { type: String, enum: ["Daily","Weekly"] },
  streak: { type: Number, default: 0 },
  lastCompletedAt: Date,
  active: { type: Boolean, default: true }, // ← JEN 'active'
}, { timestamps: true });


export const Habit = mongoose.models.Habit || model("Habit", HabitSchema);
