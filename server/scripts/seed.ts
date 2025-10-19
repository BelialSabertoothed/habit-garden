import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../src/models/User.js";
import { Habit } from "../src/models/Habit.js";

async function main() {
  const uri = process.env.MONGODB_URI!;
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB ?? "habit_garden" });

  const u = await User.create({ email: `demo+${Date.now()}@habit.garden`, nickname: "Demo" });
  await Habit.insertMany([
    { userId: u._id, name: "Drink water", category: "health", frequency: "daily" },
    { userId: u._id, name: "Recycle plastic", category: "eco", frequency: "daily" },
    { userId: u._id, name: "25m focus", category: "productivity", frequency: "daily" }
  ]);

  console.log("Seed done. USER_ID:", u._id.toString());
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
