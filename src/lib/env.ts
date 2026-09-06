import "server-only";
import { z } from "zod";

/**
 * Server-side environment validation. Phase-1 essentials are required; variables
 * for later phases are optional so the app boots before they are configured.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.url(),
  SHADOW_DATABASE_URL: z.url().optional(),

  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required (run `npx auth secret`)"),
  AUTH_URL: z.url().optional(),

  ENCRYPTION_KEY: z
    .string()
    .refine(
      (v) => Buffer.from(v, "base64").length === 32,
      "ENCRYPTION_KEY must be 32 bytes, base64-encoded",
    ),

  CRON_SECRET: z.string().min(16),

  // DayBook AI bridge -- lets the self-hosted assistant read/write real data
  // via a small set of authenticated API routes under /api/ai/*.
  AI_BACKEND_SECRET: z.string().min(16),
  AI_BOUND_USER_EMAIL: z.email(),

  // Single-user mode: registration is closed unless explicitly re-enabled.
  ALLOW_REGISTRATION: z.enum(["true", "false"]).default("false"),

  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),

  // ── later phases (optional) ──
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  GOOGLE_CALENDAR_SCOPE: z.string().default("https://www.googleapis.com/auth/calendar.events"),

  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Daybook <onboarding@resend.dev>"),

  UPSTASH_REDIS_REST_URL: z.url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),

  SENTRY_DSN: z.string().optional(),
});

// Treat empty strings (common in .env files) as "not set" so defaults and
// `.optional()` behave as expected.
const cleaned = Object.fromEntries(
  Object.entries(process.env).map(([k, v]) => [k, v === "" ? undefined : v]),
);

const parsed = schema.safeParse(cleaned);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  • ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Invalid environment variables:\n${issues}`);
}

export const env = parsed.data;

export const featureFlags = {
  googleAuth: Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET),
  email: Boolean(env.RESEND_API_KEY),
  rateLimit: Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
  webPush: Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY),
  // Explicit, not derived -- "no one can register" is a deliberate product
  // decision for this single-user deployment, not a side effect of some
  // other integration being configured or not.
  registration: env.ALLOW_REGISTRATION === "true",
} as const;
