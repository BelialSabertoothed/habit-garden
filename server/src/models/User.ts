import mongoose, { Schema, model } from "mongoose";

const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  nickname: String,
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  theme: { type: String, default: "day" }
}, { timestamps: true });
export const User = mongoose.models.User || model("User", UserSchema);
