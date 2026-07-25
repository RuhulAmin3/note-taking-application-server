import { z } from "zod";

export const noteBodySchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
});

export type NoteBodyInput = z.infer<typeof noteBodySchema>;
