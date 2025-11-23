import mongoose, { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, unique: true, sparse: true },
    passwordHash: { type: String },
    provider: { type: String, enum: ["local", "google"], required: true },
    googleId: { type: String, index: true },

    nickname: String,
    avatar: String,

    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDayKey: { type: String, default: null },
    profileComplete: { type: Boolean, default: false },
    onboardingDone: { type: Boolean, default: false },
    theme: { type: String, enum: ["day", "night"], default: "day" },
    experimentVariant: {
      type: String,
      enum: ["gamified", "control"],
      default: undefined,
    },
    notificationsEnabled: { type: Boolean, default: false },
    pushSubscription: {
      endpoint: String,
      keys: {
        p256dh: String,
        auth: String,
      },
    },

    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    emailVerificationExpiresAt: { type: Date, default: null },

    refreshTokenHash: { type: String, default: null },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

export const User = mongoose.models.User || model("User", UserSchema);
