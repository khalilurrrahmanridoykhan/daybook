import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { prisma } from "./db";

/**
 * Full user row for the current session, or null. Memoised per request.
 * Also enforces "log out everywhere": a JWT whose `sessionVersion` no longer
 * matches the database is treated as signed out.
 */
export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return null;
  if ((session.sessionVersion ?? 0) !== user.sessionVersion) return null;

  return user;
});

/** Use in Server Components / Server Actions under /app. Redirects to /login when signed out. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Lightweight variant when only the id is needed (still enforces sessionVersion). */
export async function requireUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user.id;
}
