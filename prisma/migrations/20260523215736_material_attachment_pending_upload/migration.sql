/*
  Warnings:

  - Added the required column `teacher_id` to the `material_attachments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "material_attachments" ADD COLUMN     "teacher_id" UUID NOT NULL,
ALTER COLUMN "material_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "material_attachments_teacher_id_material_id_idx" ON "material_attachments"("teacher_id", "material_id");

-- AddForeignKey
ALTER TABLE "material_attachments" ADD CONSTRAINT "material_attachments_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
