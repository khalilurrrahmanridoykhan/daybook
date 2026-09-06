import { z } from "zod";

export const noteEditorSchema = z.object({
  title: z.string().trim().max(200).default(""),
  body: z.string().trim().max(20000).default(""),
  color: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((v) => v || null),
});
