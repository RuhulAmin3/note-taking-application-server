import express from "express";
import helmet from "helmet";
import cors from "cors";
import { authRoutes } from "./modules/auth/auth.routes";
import { noteRoutes } from "./modules/note/note.routes";
import { userRoutes } from "./modules/user/user.routes";
import { postRoutes } from "./modules/post/post.routes";
import { errorHandler } from "./middleware/error";
import { connectDB } from "./config/db";

// Restrict browsers to the deployed frontend once CORS_ORIGIN is set (comma
// separated for more than one). Unset means allow any origin, which is what
// local development wants.
const allowedOrigins = process.env.CORS_ORIGIN?.split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const app = express();
app.use(helmet());
app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Connect before anything touches a model. connectDB caches its promise, so on
// a warm instance this resolves immediately. Doing it here rather than only in
// the serverless entry means the app is correct whichever entry point runs it.
app.use((_req, _res, next) => {
  connectDB().then(() => next(), next);
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Unknown route -> JSON 404 (consistent API responses instead of Express HTML)
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

app.use(errorHandler);

// Vercel detects Express and expects the server as a default export. Without
// it, any request routed to this module crashes with "Invalid export found in
// module ... The default export must be a function or server."
export default app;
