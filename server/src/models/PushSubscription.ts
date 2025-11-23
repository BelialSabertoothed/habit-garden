import { Schema, model } from "mongoose";

const PushSubscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export const PushSubscription =
  (globalThis as any).PushSubscription ||
  model("PushSubscription", PushSubscriptionSchema);