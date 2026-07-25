import { z } from "zod";

export const postBodySchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
});

export type PostBodyInput = z.infer<typeof postBodySchema>;
