-- AlterTable
ALTER TABLE "educational_materials" ADD COLUMN "teacher_name" TEXT;

-- Backfill from the teacher user profile
UPDATE "educational_materials" AS em
SET "teacher_name" = u.name
FROM "teachers" AS t
INNER JOIN "users" AS u ON u.id = t.user_id
WHERE em.teacher_id = t.id;

ALTER TABLE "educational_materials" ALTER COLUMN "teacher_name" SET NOT NULL;
