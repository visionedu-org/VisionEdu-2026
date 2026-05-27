-- CreateTable
CREATE TABLE "enem_question_favorites" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "question_key" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "index" INTEGER NOT NULL,
    "language" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enem_question_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "enem_question_favorites_student_id_created_at_idx" ON "enem_question_favorites"("student_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "enem_question_favorites_student_id_question_key_key" ON "enem_question_favorites"("student_id", "question_key");

-- AddForeignKey
ALTER TABLE "enem_question_favorites" ADD CONSTRAINT "enem_question_favorites_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
