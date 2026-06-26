-- NULL-ify empty-string document numbers so the unique constraint
-- (userId, number) allows multiple un-numbered documents (NULL ≠ NULL in Postgres)
UPDATE "Document" SET "number" = NULL WHERE "number" = '';

-- AlterTable: make number nullable, drop empty-string default
ALTER TABLE "Document" ALTER COLUMN "number" DROP NOT NULL,
ALTER COLUMN "number" DROP DEFAULT;

-- CreateIndex: (userId, number) unique — enforces no two docs share a number per user
CREATE UNIQUE INDEX "Document_userId_number_key" ON "Document"("userId", "number");
