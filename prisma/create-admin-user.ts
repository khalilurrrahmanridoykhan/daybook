/**
 * Creates (or resets) the single admin account for this single-user
 * deployment. Deliberately separate from seed.ts, which wipes and
 * recreates demo data with a hardcoded weak password every run -- never
 * safe to point at production. This script never touches Task/Note/Budget
 * rows and never hardcodes a password.
 *
 * Usage:
 *   pnpm admin:create you@example.com
 *   ADMIN_EMAIL=you@example.com pnpm admin:create
 *
 * Prints the generated password once, to stdout only. It is never written
 * to a file and never committed anywhere -- copy it now.
 */
import "dotenv/config";
import crypto from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function generatePassword(): string {
  return crypto.randomBytes(18).toString("base64url"); // 24 URL-safe chars, no ambiguous punctuation
}

async function main() {
  const email = process.argv[2] ?? process.env.ADMIN_EMAIL;
  if (!email) {
    console.error("Usage: pnpm admin:create <email>  (or set ADMIN_EMAIL)");
    process.exit(1);
  }

  const password = generatePassword();
  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        emailVerified: new Date(),
        sessionVersion: { increment: 1 }, // invalidate every existing session
      },
    });
    console.log(`Updated existing account: ${email}`);
  } else {
    await prisma.user.create({
      data: { email, passwordHash, emailVerified: new Date() },
    });
    console.log(`Created new account: ${email}`);
  }

  console.log("");
  console.log("──────────────────────────────────────────────");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log("──────────────────────────────────────────────");
  console.log("This password is shown once and is not stored anywhere else. Copy it now.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
