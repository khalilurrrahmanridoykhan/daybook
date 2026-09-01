// Minimal env so modules that validate `process.env` can be imported in tests.
process.env.DATABASE_URL ||= "postgresql://localhost:5432/daybook_test";
process.env.AUTH_SECRET ||= "test-auth-secret-value";
process.env.ENCRYPTION_KEY ||= Buffer.alloc(32, 7).toString("base64");
process.env.CRON_SECRET ||= "test-cron-secret-0123456789";

// Install BigInt JSON support (mirrors src/lib/money.ts).
import "@/lib/money";
