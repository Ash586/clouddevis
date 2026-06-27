-- jti column was missing from Session table — added to schema but never migrated
-- Existing sessions can't support revocation without jti, so clear them.
-- Users will simply need to log in again.
DELETE FROM "Session";

-- Add jti as NOT NULL UNIQUE
ALTER TABLE "Session" ADD COLUMN "jti" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Session" ALTER COLUMN "jti" DROP DEFAULT;
CREATE UNIQUE INDEX "Session_jti_key" ON "Session"("jti");
