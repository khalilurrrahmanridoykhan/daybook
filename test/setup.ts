// Minimal env so modules that validate `process.env` can be imported in tests.
process.env.DATABASE_URL ||= "postgresql://localhost:5432/daybook_test";
process.env.AUTH_SECRET ||= "test-auth-secret-value";
process.env.ENCRYPTION_KEY ||= Buffer.alloc(32, 7).toString("base64");
process.env.CRON_SECRET ||= "test-cron-secret-0123456789";
process.env.AI_BACKEND_SECRET ||= "test-ai-backend-secret-0123456789";
process.env.AI_BOUND_USER_EMAIL ||= "test-admin@daybook.local";

// Install BigInt JSON support (mirrors src/lib/money.ts).
import "@/lib/money";
