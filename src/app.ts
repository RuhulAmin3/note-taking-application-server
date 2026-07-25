import express from "express";
import helmet from "helmet";
import cors from "cors";
import { authRoutes } from "./modules/auth/auth.routes";
import { noteRoutes } from "./modules/note/note.routes";
import { userRoutes } from "./modules/user/user.routes";
import { postRoutes } from "./modules/post/post.routes";
import { errorHandler } from "./middleware/error";

export const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Unknown route -> JSON 404 (consistent API responses instead of Express HTML)
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

app.use(errorHandler);
