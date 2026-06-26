-- D-H3: Add CommissionStatus enum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- AlterTable: Commission.status String -> CommissionStatus enum
ALTER TABLE "Commission" DROP COLUMN "status",
ADD COLUMN     "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING';

-- Drop unused enums
DROP TYPE "MobileDocumentStatus";
DROP TYPE "Plan";

-- D-H1: Add indexes
CREATE INDEX "ActivityLog_entity_idx" ON "ActivityLog"("entity");
CREATE INDEX "Commission_status_idx" ON "Commission"("status");
CREATE INDEX "Document_teamId_idx" ON "Document"("teamId");
CREATE INDEX "Document_dueDate_idx" ON "Document"("dueDate");
CREATE INDEX "Document_validUntil_idx" ON "Document"("validUntil");
CREATE INDEX "PageView_userId_idx" ON "PageView"("userId");
CREATE INDEX "User_subscriptionStatus_idx" ON "User"("subscriptionStatus");
CREATE INDEX "User_suspended_idx" ON "User"("suspended");
CREATE INDEX "User_lemonsqueezyCustomerId_idx" ON "User"("lemonsqueezyCustomerId");
CREATE INDEX "User_lemonsqueezySubscriptionId_idx" ON "User"("lemonsqueezySubscriptionId");

-- D-H5: Add unique constraints on LemonSqueezy IDs
CREATE UNIQUE INDEX "User_lemonsqueezyCustomerId_key" ON "User"("lemonsqueezyCustomerId");
CREATE UNIQUE INDEX "User_lemonsqueezySubscriptionId_key" ON "User"("lemonsqueezySubscriptionId");
