import { defineConfig } from "prisma/config";
import "dotenv/config";

// Migrations must run over a DIRECT (non-pooled) connection. Neon's PgBouncer
// pooler runs in transaction mode and cannot hold the session-level advisory
// lock Prisma Migrate acquires, so `migrate deploy` fails on Vercel with
// P1002 ("Timed out trying to acquire a postgres advisory lock"). The runtime
// client keeps the pooled URL (see src/lib/prisma.ts) — only the CLI
// (migrate/generate/introspect) uses this config. Prefer an explicit
// DIRECT_URL; otherwise derive the direct host by dropping the "-pooler"
// segment from DATABASE_URL.
const pooled = process.env["DATABASE_URL"]!;
const direct = process.env["DIRECT_URL"] ?? pooled.replace("-pooler", "");

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
  },
  datasource: {
    url: direct,
  },
});
