import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');

  const sslConfig = process.env.DATABASE_URL?.includes('sslmode=require')
    ? undefined
    : process.env.NODE_ENV === 'production'
      ? { ssl: { rejectUnauthorized: true } }
      : undefined;

  const adapter = new PrismaPg({ connectionString, ...sslConfig });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
