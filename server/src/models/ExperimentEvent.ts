import mongoose, { Schema, Types } from "mongoose";

type EventType =
  | "login"
  | "habit_created"
  | "habit_completed"
  | "variant_switch"
  | "notifications_toggle"
  | "onboarding_done";

interface ExperimentEvent {
  userId: Types.ObjectId;
  type: EventType;
  variant: "gamified" | "control";
  createdAt: Date;
  // volitelný payload, podle eventu
  payload?: Record<string, any>;
}

const ExperimentEventSchema = new Schema<ExperimentEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    type: { type: String, required: true },
    variant: { type: String, enum: ["gamified", "control"], required: true },
    payload: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ExperimentEvent = mongoose.model<ExperimentEvent>(
  "ExperimentEvent",
  ExperimentEventSchema
);