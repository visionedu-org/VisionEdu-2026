-- AlterEnum
ALTER TYPE "MaterialTargetType" ADD VALUE 'student';

-- AlterTable
ALTER TABLE "material_recipients" ADD COLUMN     "student_id" UUID;

-- CreateIndex
CREATE INDEX "material_recipients_student_id_idx" ON "material_recipients"("student_id");

-- AddForeignKey
ALTER TABLE "material_recipients" ADD CONSTRAINT "material_recipients_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
