"use server";

import { z } from "zod";
import { AuthError } from "next-auth";
import { unstable_rethrow } from "next/navigation";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { featureFlags } from "@/lib/env";
import { loginSchema, registerSchema } from "@/lib/validation/auth";
import { fail, succeed, type ActionState } from "./types";

type AuthResult = ActionState<{ needsVerification: boolean }>;

export async function registerAction(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return fail("Please fix the highlighted fields.", fieldErrors);
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return fail("An account with that email already exists. Try logging in.");
  }

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      // Phase 1 wires the verification email. Until then, auto-verify in dev.
      emailVerified: featureFlags.email ? null : new Date(),
    },
  });

  if (featureFlags.email) {
    // TODO(phase-1): enqueue verification email
    return succeed({ needsVerification: true });
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/app" });
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof AuthError)
      return fail("Account created, but sign-in failed. Please log in.");
    throw error;
  }
  return succeed({ needsVerification: false });
}

export async function loginAction(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return fail("Enter your email and password.", fieldErrors);
  }

  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/app" });
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof AuthError) {
      // Surfaced generically so we don't leak which emails have accounts.
      return fail("Wrong email or password, or your email isn't verified yet.");
    }
    throw error;
  }
  return succeed({ needsVerification: false });
}
