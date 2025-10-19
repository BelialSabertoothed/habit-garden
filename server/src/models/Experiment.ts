import mongoose, { Schema, model, Types } from "mongoose";
const ExperimentSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true },
  featureKey: { type: String, default: "habit_garden_core" },
  variant: { type: String, enum: ["control","garden"], required: true },
  assignedAt: { type: Date, default: () => new Date() }
}, { timestamps: true });
ExperimentSchema.index({ userId: 1, featureKey: 1 }, { unique: true });
export const UserExperiment = mongoose.models.UserExperiment || model("UserExperiment", ExperimentSchema);
