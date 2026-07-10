-- Payment tracking: record how much of an invoice has been paid and when it was fully settled.
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);
