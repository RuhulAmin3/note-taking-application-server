import { asyncHandler } from "../../utils/asyncHandler";
import * as noteService from "./note.service";

export const createNote = asyncHandler(async (req, res) => {
  const note = await noteService.createNote(req.user!.id, req.body);
  res.status(201).json(note);
});

export const listMyNotes = asyncHandler(async (req, res) => {
  const result = await noteService.listMyNotes(req.user!.id, req.query);
  res.json(result);
});

export const listAllNotes = asyncHandler(async (req, res) => {
  const result = await noteService.listAllNotes(req.query);
  res.json(result);
});

export const getNote = asyncHandler(async (req, res) => {
  const note = await noteService.getNote(req.params.id, req.user!.id, req.user!.role);
  res.json(note);
});

export const updateNote = asyncHandler(async (req, res) => {
  const note = await noteService.updateNote(req.params.id, req.user!.id, req.user!.role, req.body);
  res.json(note);
});

export const deleteNote = asyncHandler(async (req, res) => {
  await noteService.deleteNote(req.params.id, req.user!.id, req.user!.role);
  res.status(204).send();
});
