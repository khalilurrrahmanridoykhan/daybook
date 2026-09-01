import "dotenv/config";
import { defineConfig } from "prisma/config";

const datasource: { url: string; shadowDatabaseUrl?: string } = {
  url: process.env.DATABASE_URL ?? "",
};

// Optional: only needed where the app DB user cannot create databases (e.g. Neon).
if (process.env.SHADOW_DATABASE_URL) {
  datasource.shadowDatabaseUrl = process.env.SHADOW_DATABASE_URL;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource,
});
