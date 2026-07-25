import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { adminCreateSchema, adminUpdateSchema } from "./user.validation";
import {
  getMe, listUsers, getUser, createUser, updateUser, deleteUser, groupByInterests,
} from "./user.controller";

export const userRoutes = Router();
userRoutes.use(authenticate);
userRoutes.get("/me", getMe);
userRoutes.get("/grouped-by-interests", authorize("admin"), groupByInterests);
userRoutes.get("/", authorize("admin"), listUsers);
userRoutes.post("/", authorize("admin"), validate(adminCreateSchema), createUser);
userRoutes.get("/:id", authorize("admin"), getUser);
userRoutes.patch("/:id", authorize("admin"), validate(adminUpdateSchema), updateUser);
userRoutes.delete("/:id", authorize("admin"), deleteUser);
