-- Fix schema drift: columns/enums/indexes that were in schema.prisma but never
-- actually applied to production (prior migrations ran with 0 steps).

-- 1. fcmToken — the column blocking every register/login call
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "fcmToken" TEXT;

-- 2. CommissionStatus enum (may already exist — skip if so)
DO $$ BEGIN
  CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Swap Commission.status from Text → CommissionStatus enum (idempotent)
DO $$ BEGIN
  ALTER TABLE "Commission" ALTER COLUMN "status" TYPE "CommissionStatus"
    USING "status"::"CommissionStatus";
EXCEPTION WHEN others THEN NULL;
END $$;

-- 4. Drop LoginAttempt table (removed from schema, kept in DB by orphan migration)
DROP TABLE IF EXISTS "LoginAttempt";

-- 5. Indexes (IF NOT EXISTS guards make these idempotent)
CREATE INDEX IF NOT EXISTS "ActivityLog_entity_idx" ON "ActivityLog"("entity");
CREATE INDEX IF NOT EXISTS "Commission_status_idx"  ON "Commission"("status");
CREATE INDEX IF NOT EXISTS "Document_teamId_idx"    ON "Document"("teamId");
CREATE INDEX IF NOT EXISTS "Document_dueDate_idx"   ON "Document"("dueDate");
CREATE INDEX IF NOT EXISTS "Document_validUntil_idx" ON "Document"("validUntil");
CREATE INDEX IF NOT EXISTS "PageView_userId_idx"    ON "PageView"("userId");
CREATE INDEX IF NOT EXISTS "User_subscriptionStatus_idx" ON "User"("subscriptionStatus");
CREATE INDEX IF NOT EXISTS "User_suspended_idx"     ON "User"("suspended");
CREATE INDEX IF NOT EXISTS "User_lemonsqueezyCustomerId_idx"     ON "User"("lemonsqueezyCustomerId");
CREATE INDEX IF NOT EXISTS "User_lemonsqueezySubscriptionId_idx" ON "User"("lemonsqueezySubscriptionId");

-- 6. Unique constraints on LemonSqueezy IDs
CREATE UNIQUE INDEX IF NOT EXISTS "User_lemonsqueezyCustomerId_key"     ON "User"("lemonsqueezyCustomerId");
CREATE UNIQUE INDEX IF NOT EXISTS "User_lemonsqueezySubscriptionId_key" ON "User"("lemonsqueezySubscriptionId");

-- 7. Drop obsolete indexes that no longer exist in schema
DROP INDEX IF EXISTS "Client_userId_nif_idx";
DROP INDEX IF EXISTS "Client_userId_rc_idx";
DROP INDEX IF EXISTS "Company_nif_idx";
