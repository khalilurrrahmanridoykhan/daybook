import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "./db";

/**
 * Single-use email tokens (verification + password reset), stored hashed so a
 * database leak never exposes a live token. The raw token travels in the link.
 */

type Kind = "verify" | "reset";

const TTL_MS: Record<Kind, number> = {
  verify: 1000 * 60 * 60 * 24, // 24h
  reset: 1000 * 60 * 30, // 30m
};

const identifierFor = (kind: Kind, email: string) =>
  kind === "reset" ? `reset:${email.toLowerCase()}` : email.toLowerCase();

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createToken(kind: Kind, email: string): Promise<string> {
  const identifier = identifierFor(kind, email);
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const token = randomBytes(32).toString("base64url");
  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hash(token),
      expires: new Date(Date.now() + TTL_MS[kind]),
    },
  });
  return token;
}

/** Returns true and deletes the token when valid; false otherwise. */
export async function consumeToken(kind: Kind, email: string, token: string): Promise<boolean> {
  const identifier = identifierFor(kind, email);
  const key = { identifier_token: { identifier, token: hash(token) } };

  const row = await prisma.verificationToken.findUnique({ where: key });
  if (!row) return false;

  await prisma.verificationToken.delete({ where: key }).catch(() => {});
  return row.expires.getTime() > Date.now();
}
