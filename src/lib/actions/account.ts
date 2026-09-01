"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/password";
import { signOut } from "@/lib/auth";
import { changePasswordSchema, deleteAccountSchema, profileSchema } from "@/lib/validation/account";
import { fail, succeed, type ActionState } from "./types";

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return fail("Please fix the highlighted fields.", fieldErrors);
  }

  await prisma.user.update({ where: { id: user.id }, data: parsed.data });
  revalidatePath("/app/settings");
  revalidatePath("/app", "layout");
  return succeed(undefined);
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return fail("Please fix the highlighted fields.", fieldErrors);
  }

  if (!user.passwordHash || !(await verifyPassword(parsed.data.current, user.passwordHash))) {
    return fail("Your current password is not right.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.next) },
  });
  return succeed(undefined);
}

export async function logOutEverywhereAction(): Promise<void> {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { sessionVersion: { increment: 1 } },
  });
  await signOut({ redirectTo: "/login" });
}

export async function deleteAccountAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = deleteAccountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Enter your password to confirm.");

  if (!user.passwordHash || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return fail("That password is not right.");
  }

  await prisma.user.delete({ where: { id: user.id } });

  try {
    await signOut({ redirectTo: "/" });
  } catch (error) {
    unstable_rethrow(error);
  }
  return succeed(undefined);
}
