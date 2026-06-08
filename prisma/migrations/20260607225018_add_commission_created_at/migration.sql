-- AlterTable
ALTER TABLE "Commission" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Commission_createdAt_idx" ON "Commission"("createdAt");
