import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { round2 } from '@/lib/calculations';

const globalForPrisma = globalThis as unknown as { prisma: ReturnType<typeof createPrismaClient> | undefined };

function calcTotalHT(qty: number, price: number) {
  return round2(qty * price);
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');

  const sslConfig = process.env.DATABASE_URL?.includes('sslmode=require')
    ? undefined
    : process.env.NODE_ENV === 'production'
      ? { ssl: { rejectUnauthorized: true } }
      : undefined;

  const adapter = new PrismaPg({ connectionString, ...sslConfig });
  const client = new PrismaClient({ adapter });
  const extended = client.$extends({
    query: {
      user: {
        async create({ args, query }) {
          const data = args.data as { password?: string };
          if (data.password) {
            data.password = await bcrypt.hash(data.password, 12);
          }
          return query(args);
        },
        async update({ args, query }) {
          const data = args.data as { password?: string };
          if (data?.password) {
            data.password = await bcrypt.hash(data.password, 12);
          }
          return query(args);
        },
        async upsert({ args, query }) {
          const create = args.create as { password?: string };
          if (create?.password) {
            create.password = await bcrypt.hash(create.password, 12);
          }
          const update = args.update as { password?: string };
          if (update?.password) {
            update.password = await bcrypt.hash(update.password, 12);
          }
          return query(args);
        },
      },
      lineItem: {
        async create({ args, query }) {
          const data = args.data as { quantity?: number; unitPrice?: number; totalHT?: number };
          data.totalHT = calcTotalHT(data.quantity ?? 0, data.unitPrice ?? 0);
          return query(args);
        },
        async update({ args, query }) {
          const data = args.data as { quantity?: number; unitPrice?: number; totalHT?: number };
          if (data.quantity !== undefined || data.unitPrice !== undefined) {
            data.totalHT = calcTotalHT(
              data.quantity ?? 0,
              data.unitPrice ?? 0,
            );
          }
          return query(args);
        },
        async upsert({ args, query }) {
          const create = args.create as { quantity?: number; unitPrice?: number; totalHT?: number };
          create.totalHT = calcTotalHT(create.quantity ?? 0, create.unitPrice ?? 0);
          const update = args.update as { quantity?: number; unitPrice?: number; totalHT?: number };
          if (update.quantity !== undefined || update.unitPrice !== undefined) {
            update.totalHT = calcTotalHT(
              update.quantity ?? 0,
              update.unitPrice ?? 0,
            );
          }
          return query(args);
        },
      },
    },
  });
  return extended;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
