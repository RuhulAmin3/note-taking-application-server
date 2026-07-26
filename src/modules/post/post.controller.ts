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

export const listAllPosts = asyncHandler(async (req, res) => {
  const result = await postService.listAllPosts(req.query);
  res.json(result);
});

export const updatePost = asyncHandler(async (req, res) => {
  const post = await postService.updatePost(req.params.id, req.user!.id, req.user!.role, req.body);
  res.json(post);
});

export const deletePost = asyncHandler(async (req, res) => {
  await postService.deletePost(req.params.id, req.user!.id, req.user!.role);
  res.status(204).send();
});
