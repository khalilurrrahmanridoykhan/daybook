import "server-only";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

/**
 * Auth for the /api/ai/* routes -- the same bearer-secret pattern as
 * /api/cron/[job]/route.ts, since this is another server-to-server caller
 * (the self-hosted AI backend) with no browser session to check instead.
 */
export class AiBridgeUnauthorized extends Error {}

export function requireAiSecret(request: Request): void {
  if (request.headers.get("authorization") !== `Bearer ${env.AI_BACKEND_SECRET}`) {
    throw new AiBridgeUnauthorized();
  }
}

/**
 * Single-user app: the AI always acts as this one hardcoded account,
 * resolved by AI_BOUND_USER_EMAIL -- never by a userId the caller supplies.
 * A leaked AI_BACKEND_SECRET can only ever touch this one account's data,
 * even if the app ever gains more users later.
 */
export async function resolveSoleUser() {
  return prisma.user.findUniqueOrThrow({ where: { email: env.AI_BOUND_USER_EMAIL } });
}

/** Wraps a route handler body: 401s on a bad/missing secret instead of throwing. */
export async function withAiAuth<T>(
  request: Request,
  handler: (user: Awaited<ReturnType<typeof resolveSoleUser>>) => Promise<T>,
): Promise<T | NextResponse> {
  try {
    requireAiSecret(request);
  } catch (error) {
    if (error instanceof AiBridgeUnauthorized) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    throw error;
  }
  const user = await resolveSoleUser();
  return handler(user);
}
