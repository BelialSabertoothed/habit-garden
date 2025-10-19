import mongoose, { Schema, model, Types } from "mongoose";
const EventSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User" },
  type:   { type: String, required: true },
  payload:{ type: Object, default: {} },
  ts:     { type: Date, default: () => new Date() }
}, { timestamps: true });
EventSchema.index({ userId: 1, ts: -1 });
export const Event = mongoose.models.Event || model("Event", EventSchema);
