import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { postBodySchema } from "./post.validation";
import {
  createPost, getUserPosts, listAllPosts, updatePost, deletePost,
} from "./post.controller";

export const postRoutes = Router();
postRoutes.use(authenticate);
postRoutes.get("/all", authorize("admin"), listAllPosts); // before "/:id"
postRoutes.post("/", validate(postBodySchema), createPost);
postRoutes.get("/user/:userId", getUserPosts);
postRoutes.patch("/:id", validate(postBodySchema.partial()), updatePost);
postRoutes.delete("/:id", deletePost);
