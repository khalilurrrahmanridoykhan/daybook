import { z } from "zod";
import { toMinor } from "@/lib/money";

const amountSchema = z.union([z.string(), z.number()]).transform((v, ctx) => {
  try {
    return toMinor(v);
  } catch {
    ctx.addIssue({ code: "custom", message: "Enter a valid amount" });
    return z.NEVER;
  }
});

export const walletTypeEnum = z.enum(["CASH", "BANK", "MOBILE"]);
export const categoryKindEnum = z.enum(["SAVINGS", "EXPENSE"]);
export const txDirectionEnum = z.enum(["EXPENSE", "REFUND"]);

export const walletSchema = z.object({
  name: z.string().trim().min(1, "Name the wallet").max(100),
  type: walletTypeEnum.default("CASH"),
  openingBalance: amountSchema.default(() => 0n),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name the category").max(100),
  kind: categoryKindEnum.default("EXPENSE"),
  color: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((v) => v || null),
  monthlyDefault: amountSchema.default(() => 0n),
  rolloverEnabled: z.coerce.boolean().default(false),
});

export const incomeEntrySchema = z.object({
  source: z.string().trim().min(1, "Say where this came from").max(100),
  amount: amountSchema,
  walletId: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || null),
});

export const allocationSchema = z
  .object({
    categoryId: z.string().min(1),
    plannedAmount: amountSchema.optional(),
    plannedPercent: z.coerce.number().min(0).max(100).optional(),
  })
  .refine((v) => v.plannedAmount !== undefined || v.plannedPercent !== undefined, {
    message: "Set an amount or a percent",
  });

export const transactionSchema = z.object({
  categoryId: z.string().min(1, "Choose a category"),
  amount: amountSchema,
  direction: txDirectionEnum.default("EXPENSE"),
  walletId: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || null),
  note: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => v || null),
  taskId: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || null),
});

export const transferSchema = z
  .object({
    fromWalletId: z.string().min(1),
    toWalletId: z.string().min(1),
    amount: amountSchema,
    note: z
      .string()
      .trim()
      .max(500)
      .optional()
      .transform((v) => v || null),
  })
  .refine((v) => v.fromWalletId !== v.toWalletId, { message: "Pick two different wallets" });
