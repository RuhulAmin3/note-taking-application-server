import { Router } from "express";
import { validate } from "../../middleware/validate";
import { registerSchema, loginSchema } from "./auth.validation";
import { register, login } from "./auth.controller";

export const authRoutes = Router();
authRoutes.post("/register", validate(registerSchema), register);
authRoutes.post("/login", validate(loginSchema), login);
