-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "companyInfo" JSONB;

-- The logo and signature will be stored in companyInfo as JSON:
-- { "name": "...", "address": "...", "taxIds": { "nif": "...", "rc": "...", "nis": "...", "ai": "..." }, "capital": "...", "logo": "..." }