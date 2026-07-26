import mongoose from "mongoose";
import { env } from "./env";

// Serverless invocations share a warm module scope, so the connection promise
// is cached here. Without it every request would dial Atlas again and exhaust
// the cluster's connection pool.
let connection: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<void> {
  if (!connection) {
    connection = mongoose
      .connect(env.MONGODB_URI)
      .then(async (m) => {
        // Building declared indexes on boot is useful in development. In
        // production they already exist, and this would run on every cold start.
        if (process.env.NODE_ENV !== "production") {
          await m.connection.syncIndexes();
        }
        console.log("MongoDB connected");
        return m;
      })
      .catch((err) => {
        // Never cache a failed attempt, or the function stays broken until the
        // instance is evicted.
        connection = null;
        throw err;
      });
  }
  await connection;
}
