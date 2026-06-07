import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');
  // Enable SSL in production for hosted PostgreSQL providers (Neon, Supabase, etc.)
  const adapter = new PrismaPg({
    connectionString,
    ...(process.env.NODE_ENV === 'production' ? { ssl: { rejectUnauthorized: false } } : {}),
  });
  return new PrismaClient({ adapter });
}

// Lazy: only creates client on first query, safe for build time
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: PrismaClient = globalForPrisma.prisma ?? (new Proxy({} as any, {
  get(_target, prop, receiver) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    const value = Reflect.get(globalForPrisma.prisma, prop, receiver);
    if (typeof value === 'function') return value.bind(globalForPrisma.prisma);
    return value;
  },
}) as unknown as PrismaClient);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
