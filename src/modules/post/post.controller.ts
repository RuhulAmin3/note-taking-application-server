import { asyncHandler } from "../../utils/asyncHandler";
import * as postService from "./post.service";

export const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost(req.user!.id, req.body);
  res.status(201).json(post);
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const result = await postService.getUserPosts(req.params.userId, req.query);
  res.json(result);
});
