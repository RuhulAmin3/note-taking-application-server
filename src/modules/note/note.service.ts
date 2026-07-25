import { Note } from "./note.model";
import { AppError } from "../../middleware/error";
import { parsePagination, buildMeta } from "../../utils/pagination";
import { NoteBodyInput } from "./note.validation";

export function createNote(ownerId: string, input: NoteBodyInput) {
  return Note.create({ ...input, owner: ownerId });
}

// current user's own notes — uses { owner, createdAt } index
export async function listMyNotes(ownerId: string, query: Record<string, unknown>) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { owner: ownerId };
  const [data, total] = await Promise.all([
    Note.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Note.countDocuments(filter),
  ]);
  return { data, meta: buildMeta(total, page, limit) };
}

// admin: everyone's notes. Unfiltered → paginate by _id (default index).
export async function listAllNotes(query: Record<string, unknown>) {
  const { page, limit, skip } = parsePagination(query);
  const [data, total] = await Promise.all([
    Note.find().sort({ _id: -1 }).skip(skip).limit(limit).populate("owner", "name email"),
    Note.estimatedDocumentCount(),
  ]);
  return { data, meta: buildMeta(total, page, limit) };
}

async function findOwnedOrAdmin(id: string, userId: string, role: string) {
  const note = await Note.findById(id);
  if (!note) throw new AppError(404, "Note not found");
  if (role !== "admin" && note.owner.toString() !== userId) throw new AppError(403, "Forbidden");
  return note;
}

export function getNote(id: string, userId: string, role: string) {
  return findOwnedOrAdmin(id, userId, role);
}

export async function updateNote(id: string, userId: string, role: string, input: Partial<NoteBodyInput>) {
  const note = await findOwnedOrAdmin(id, userId, role);
  Object.assign(note, input);
  await note.save();
  return note;
}

export async function deleteNote(id: string, userId: string, role: string) {
  const note = await findOwnedOrAdmin(id, userId, role);
  await note.deleteOne();
}
