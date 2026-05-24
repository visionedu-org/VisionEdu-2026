-- CreateEnum
CREATE TYPE "MaterialLogAction" AS ENUM ('created', 'updated', 'deleted', 'downloaded');

-- CreateTable
CREATE TABLE "material_attachments" (
    "id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "checksum" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_delivery_logs" (
    "id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "actor_user_id" UUID NOT NULL,
    "action" "MaterialLogAction" NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_delivery_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "material_delivery_logs_material_id_created_at_idx" ON "material_delivery_logs"("material_id", "created_at");

-- AddForeignKey
ALTER TABLE "material_attachments" ADD CONSTRAINT "material_attachments_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "educational_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_delivery_logs" ADD CONSTRAINT "material_delivery_logs_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "educational_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_delivery_logs" ADD CONSTRAINT "material_delivery_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
