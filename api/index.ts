import type { IncomingMessage, ServerResponse } from "http";
import { app } from "../src/app";
import { connectDB } from "../src/config/db";

/**
 * Vercel entry point.
 *
 * Serverless has no long-lived process, so there is no `app.listen` here —
 * every request enters through this handler instead. `src/server.ts` still
 * listens for local development.
 *
 * connectDB caches its connection at module scope, so a warm invocation
 * reuses the open one rather than dialling Atlas again.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await connectDB();
  return app(req, res);
}
