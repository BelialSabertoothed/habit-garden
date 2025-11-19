import mongoose, { Schema, model } from "mongoose";

// models/Habit.ts (ukázka klíčových polí)
const HabitSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, index: true, required: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, enum: ["Health","Eco","Productivity","Relationships","Creativity", "Custom"], required: true },
  icon: { type: String, enum: ["heart","leaf","briefcase","users","palette"], required: true }, // ← doplněno "palette"
  frequency: { type: String, enum: ["Daily","Weekly"], required: true },
  worth: { type: Number, default: 10, min: 1, max: 100 }, // můžeš upravit rozsah
  streak: { type: Number, default: 0 },
  lastCompletedAt: Date,
  active: { type: Boolean, default: true },
}, { timestamps: true });



export const Habit = mongoose.models.Habit || model("Habit", HabitSchema);
