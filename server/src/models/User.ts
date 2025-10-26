import mongoose, { Schema, model } from "mongoose";

const UserSchema = new Schema({
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String },       // jen pro email+heslo
  provider: { type: String, enum: ["local", "google"], required: true },
  googleId: { type: String, index: true },
  nickname: String,
  verified: { type: Boolean, default: false },
  roles: { type: [String], default: [] },
  refreshTokenHash: { type: String, default: null }, // pro 1 aktivní refresh token
  lastLoginAt: Date
}, { timestamps: true });

export const User = mongoose.models.User || model("User", UserSchema);
