import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { round2 } from '@/lib/calculations';
import { encryptField, decryptField } from '@/lib/fieldCrypto';

// Fields to encrypt at rest for Client and Company models
const FISCAL_FIELDS = ['nif', 'nis', 'rc', 'ai'] as const;
type FiscalRecord = Partial<Record<typeof FISCAL_FIELDS[number], string | null>>;

function encryptFiscal(data: FiscalRecord): void {
  for (const k of FISCAL_FIELDS) {
    if (typeof data[k] === 'string') data[k] = encryptField(data[k]);
  }
}

function decryptFiscal<T extends FiscalRecord>(record: T): T {
  for (const k of FISCAL_FIELDS) {
    if (typeof record[k] === 'string') record[k] = decryptField(record[k]);
  }
  return record;
}

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
      client: {
        async create({ args, query }) {
          encryptFiscal(args.data as FiscalRecord);
          return query(args);
        },
        async update({ args, query }) {
          encryptFiscal(args.data as FiscalRecord);
          return query(args);
        },
        async upsert({ args, query }) {
          encryptFiscal(args.create as FiscalRecord);
          encryptFiscal(args.update as FiscalRecord);
          return query(args);
        },
      },
      company: {
        async create({ args, query }) {
          encryptFiscal(args.data as FiscalRecord);
          return query(args);
        },
        async update({ args, query }) {
          encryptFiscal(args.data as FiscalRecord);
          return query(args);
        },
        async upsert({ args, query }) {
          encryptFiscal(args.create as FiscalRecord);
          encryptFiscal(args.update as FiscalRecord);
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
  // Decrypt fiscal fields transparently on every read
  const withDecrypt = extended.$extends({
    result: {
      client: {
        nif: { needs: { nif: true }, compute: (r) => decryptField(r.nif) },
        nis: { needs: { nis: true }, compute: (r) => decryptField(r.nis) },
        rc:  { needs: { rc:  true }, compute: (r) => decryptField(r.rc)  },
        ai:  { needs: { ai:  true }, compute: (r) => decryptField(r.ai)  },
      },
      company: {
        nif: { needs: { nif: true }, compute: (r) => decryptField(r.nif) },
        nis: { needs: { nis: true }, compute: (r) => decryptField(r.nis) },
        rc:  { needs: { rc:  true }, compute: (r) => decryptField(r.rc)  },
        ai:  { needs: { ai:  true }, compute: (r) => decryptField(r.ai)  },
      },
    },
  });

  return withDecrypt;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
