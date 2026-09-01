"use server";

import { z } from "zod";
import { AuthError } from "next-auth";
import { unstable_rethrow } from "next/navigation";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { env, featureFlags } from "@/lib/env";
import { createToken, consumeToken } from "@/lib/tokens";
import { resetEmail, sendMail, verificationEmail } from "@/lib/email";
import { emailSchema, loginSchema, passwordSchema, registerSchema } from "@/lib/validation/auth";
import { fail, succeed, type ActionState } from "./types";

type AuthResult = ActionState<{ needsVerification: boolean }>;

async function sendVerification(email: string) {
  const token = await createToken("verify", email);
  const link = `${env.NEXT_PUBLIC_APP_URL}/verify?token=${token}&email=${encodeURIComponent(email)}`;
  await sendMail({ to: email, ...verificationEmail(link) });
}

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
      // With email configured, users verify before first login. Otherwise
      // (local dev) the account is usable immediately.
      emailVerified: featureFlags.email ? null : new Date(),
    },
  });

  if (featureFlags.email) {
    await sendVerification(email);
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

export async function resendVerificationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) return fail("Enter a valid email.");

  const user = await prisma.user.findUnique({
    where: { email: email.data },
    select: { emailVerified: true },
  });
  // Always report success — never reveal whether the address exists.
  if (user && !user.emailVerified) await sendVerification(email.data);
  return succeed(undefined);
}

export async function requestPasswordResetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) return fail("Enter a valid email.");

  const user = await prisma.user.findUnique({
    where: { email: email.data },
    select: { id: true },
  });
  if (user) {
    const token = await createToken("reset", email.data);
    const link = `${env.NEXT_PUBLIC_APP_URL}/reset/${token}?email=${encodeURIComponent(email.data)}`;
    await sendMail({ to: email.data, ...resetEmail(link) });
  }
  return succeed(undefined);
}

const resetSchema = z.object({
  email: emailSchema,
  token: z.string().min(1),
  password: passwordSchema,
});

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return fail("Choose a password of at least 8 characters.", fieldErrors);
  }
  const { email, token, password } = parsed.data;

  const ok = await consumeToken("reset", email, token);
  if (!ok) return fail("That reset link has expired. Request a new one.");

  await prisma.user.update({
    where: { email },
    data: {
      passwordHash: await hashPassword(password),
      emailVerified: new Date(),
      // invalidate every existing session
      sessionVersion: { increment: 1 },
    },
  });
  return succeed(undefined);
}
