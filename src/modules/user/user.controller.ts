import { asyncHandler } from "../../utils/asyncHandler";
import * as userService from "./user.service";

export const getMe = asyncHandler(async (req, res) => {
  res.json(await userService.getMe(req.user!.id));
});

export const listUsers = asyncHandler(async (req, res) => {
  res.json(await userService.listUsers(req.query));
});

export const getUser = asyncHandler(async (req, res) => {
  res.json(await userService.getUser(req.params.id));
});

export const createUser = asyncHandler(async (req, res) => {
  res.status(201).json(await userService.createUser(req.body));
});

export const updateUser = asyncHandler(async (req, res) => {
  res.json(await userService.updateUser(req.params.id, req.body));
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.status(204).send();
});

export const groupByInterests = asyncHandler(async (_req, res) => {
  res.json(await userService.groupByInterests());
});
