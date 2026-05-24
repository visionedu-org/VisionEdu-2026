-- CreateEnum
CREATE TYPE "MaterialContentType" AS ENUM ('text', 'video_link', 'file');

-- CreateEnum
CREATE TYPE "MaterialTargetType" AS ENUM ('class');

-- CreateTable
CREATE TABLE "educational_materials" (
    "id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "content_type" "MaterialContentType" NOT NULL,
    "body_text" TEXT,
    "video_url" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "educational_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_recipients" (
    "id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "target_type" "MaterialTargetType" NOT NULL,
    "class_id" UUID NOT NULL,

    CONSTRAINT "material_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "educational_materials_teacher_id_sent_at_idx" ON "educational_materials"("teacher_id", "sent_at");

-- AddForeignKey
ALTER TABLE "educational_materials" ADD CONSTRAINT "educational_materials_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educational_materials" ADD CONSTRAINT "educational_materials_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_recipients" ADD CONSTRAINT "material_recipients_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "educational_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_recipients" ADD CONSTRAINT "material_recipients_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
