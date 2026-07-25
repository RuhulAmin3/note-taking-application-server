import { asyncHandler } from "../../utils/asyncHandler";
import * as authService from "./auth.service";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  res.json(result);
});
