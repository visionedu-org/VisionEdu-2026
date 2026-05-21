-- CreateTable
CREATE TABLE "teacher_schools" (
    "teacher_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,

    CONSTRAINT "teacher_schools_pkey" PRIMARY KEY ("teacher_id","school_id")
);

-- AddForeignKey
ALTER TABLE "teacher_schools" ADD CONSTRAINT "teacher_schools_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_schools" ADD CONSTRAINT "teacher_schools_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill from existing class assignments
INSERT INTO "teacher_schools" ("teacher_id", "school_id")
SELECT DISTINCT tc."teacher_id", c."school_id"
FROM "teacher_classes" tc
INNER JOIN "classes" c ON c."id" = tc."class_id"
ON CONFLICT DO NOTHING;
