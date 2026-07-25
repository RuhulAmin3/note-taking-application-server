import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { postBodySchema } from "./post.validation";
import { createPost, getUserPosts } from "./post.controller";

export const postRoutes = Router();
postRoutes.use(authenticate);
postRoutes.post("/", validate(postBodySchema), createPost);
postRoutes.get("/user/:userId", getUserPosts);
