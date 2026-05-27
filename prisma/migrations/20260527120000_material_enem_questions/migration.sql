-- AlterEnum
ALTER TYPE "MaterialContentType" ADD VALUE 'questions';

-- CreateTable
CREATE TABLE "material_enem_questions" (
    "id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "question_key" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "index" INTEGER NOT NULL,
    "language" TEXT,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "material_enem_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "material_enem_questions_material_id_sort_order_idx" ON "material_enem_questions"("material_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "material_enem_questions_material_id_question_key_key" ON "material_enem_questions"("material_id", "question_key");

-- AddForeignKey
ALTER TABLE "material_enem_questions" ADD CONSTRAINT "material_enem_questions_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "educational_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
