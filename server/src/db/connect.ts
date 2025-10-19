import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing in .env");
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB ?? "habit-garden" });
  console.log("✅ MongoDB connected");
}
