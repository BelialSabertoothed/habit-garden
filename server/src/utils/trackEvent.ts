import { Types } from "mongoose";
import { ExperimentEvent } from "../models/ExperimentEvent.js";
import { User } from "../models/User.js";

export async function trackEvent(opts: {
  userId: string | Types.ObjectId;
  type:
    | "login"
    | "habit_created"
    | "habit_completed"
    | "variant_switch"
    | "notifications_toggle"
    | "onboarding_done";
  payload?: Record<string, any>;
}) {
  const user = (await User.findById(opts.userId).lean()) as
    | { _id: Types.ObjectId; experimentVariant?: string }
    | null;
  if (!user) return;

  const variant = user.experimentVariant ?? "gamified";

  await ExperimentEvent.create({
    userId: user._id,
    type: opts.type,
    variant,
    payload: opts.payload ?? {},
  });
}