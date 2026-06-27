// Next.js instrumentation — runs once when the server starts.
// Validates that the production DB is in sync with the Prisma schema.
// If critical columns are missing, logs a loud warning so the issue
// is caught immediately in Vercel function logs instead of surfacing
// as a cryptic 500 on the first real user request.

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NODE_ENV !== 'production') return;

  try {
    const { PrismaPg } = await import('@prisma/adapter-pg');
    const { PrismaClient } = await import('@prisma/client');

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.error('[STARTUP] ❌ DATABASE_URL is not set');
      return;
    }

    const adapter = new PrismaPg({ connectionString });
    const client = new PrismaClient({ adapter });

    // Spot-check the columns that have caused 500s in the past.
    // Add any new column here whenever you add one to schema.prisma.
    const checks: Array<{ table: string; column: string }> = [
      { table: 'User',    column: 'fcmToken' },
      { table: 'Session', column: 'jti' },
      { table: 'User',    column: 'docCountThisMonth' },
      { table: 'Document', column: 'language' },
      { table: 'Company', column: 'nif' },
    ];

    const result = await client.$queryRaw<{ table_name: string; column_name: string }[]>`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND (table_name, column_name) IN (
          ${checks.map(c => `('${c.table}','${c.column}')`).join(',')}
        )
    `;

    const found = new Set(result.map(r => `${r.table_name}.${r.column_name}`));
    const missing = checks.filter(c => !found.has(`${c.table}.${c.column}`));

    if (missing.length > 0) {
      console.error(
        '[STARTUP] ❌ SCHEMA DRIFT — missing columns in production DB:\n' +
        missing.map(c => `  • ${c.table}.${c.column}`).join('\n') +
        '\nRun: npx prisma migrate deploy'
      );
    } else {
      console.log('[STARTUP] ✅ DB schema check passed — all critical columns present');
    }

    await client.$disconnect();
  } catch (e) {
    console.error('[STARTUP] ⚠️  Could not run schema check:', String(e));
  }
}
