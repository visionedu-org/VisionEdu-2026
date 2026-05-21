-- AlterTable
ALTER TABLE "users" ADD COLUMN "city" TEXT;

UPDATE "users" SET "city" = 'Vila Nova do Piauí' WHERE "city" IS NULL;

ALTER TABLE "users" ALTER COLUMN "city" SET NOT NULL;
