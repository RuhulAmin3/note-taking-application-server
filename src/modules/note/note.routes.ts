import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { noteBodySchema } from "./note.validation";
import {
  createNote, listMyNotes, listAllNotes, getNote, updateNote, deleteNote,
} from "./note.controller";

export const noteRoutes = Router();
noteRoutes.use(authenticate);
noteRoutes.get("/all", authorize("admin"), listAllNotes); // before "/:id"
noteRoutes.post("/", validate(noteBodySchema), createNote);
noteRoutes.get("/", listMyNotes);
noteRoutes.get("/:id", getNote);
noteRoutes.patch("/:id", validate(noteBodySchema.partial()), updateNote);
noteRoutes.delete("/:id", deleteNote);
