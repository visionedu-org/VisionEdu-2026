-- AlterTable
ALTER TABLE "educational_materials" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "material_reads" (
    "id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_reads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "material_reads_student_id_read_at_idx" ON "material_reads"("student_id", "read_at");

-- CreateIndex
CREATE UNIQUE INDEX "material_reads_student_id_material_id_key" ON "material_reads"("student_id", "material_id");

-- AddForeignKey
ALTER TABLE "material_reads" ADD CONSTRAINT "material_reads_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "educational_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_reads" ADD CONSTRAINT "material_reads_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
