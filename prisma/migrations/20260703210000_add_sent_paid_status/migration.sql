-- AlterEnum: invoice-lifecycle statuses used by the mobile app (DRAFT -> SENT -> PAID)
ALTER TYPE "DocumentStatus" ADD VALUE 'SENT';
ALTER TYPE "DocumentStatus" ADD VALUE 'PAID';
