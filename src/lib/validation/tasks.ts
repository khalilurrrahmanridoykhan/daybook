import { z } from "zod";
import { isValidRRule } from "@/lib/services/recurring";

export const taskStatusEnum = z.enum(["TODO", "DOING", "DONE"]);
export const taskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const REMINDER_OFFSETS = [
  { label: "No reminder", value: "" },
  { label: "At the time", value: "0" },
  { label: "10 minutes before", value: "10" },
  { label: "1 hour before", value: "60" },
  { label: "1 day before", value: "1440" },
] as const;

export const taskEditorSchema = z.object({
  title: z.string().trim().min(1, "Give the task a title").max(200),
  details: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .transform((v) => v || null),
  priority: taskPriorityEnum.default("MEDIUM"),
  recurrenceRule: z.string().default("").refine(isValidRRule, "That repeat rule isn't valid"),
});
