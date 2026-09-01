import { z } from "zod";
import { isSupportedCurrency } from "@/lib/currency";
import { passwordSchema } from "./auth";

const timezones = new Set<string>(
  typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [],
);

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Tell us your name").max(80),
  timezone: z
    .string()
    .refine((t) => timezones.size === 0 || timezones.has(t), "Choose a valid timezone"),
  currency: z.string().refine(isSupportedCurrency, "Choose a supported currency"),
});

export const changePasswordSchema = z.object({
  current: z.string().min(1, "Enter your current password"),
  next: passwordSchema,
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Enter your password to confirm"),
});
