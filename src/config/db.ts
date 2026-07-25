import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
  // Build declared indexes on startup (dev). Remove/guard in prod if desired.
  await mongoose.connection.syncIndexes();
  console.log("MongoDB connected");
}
