-- CreateEnum
CREATE TYPE "LearningPathStepStatus" AS ENUM ('locked', 'in_progress', 'completed');

-- CreateTable
CREATE TABLE "enem_question_attempts" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "question_key" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "index" INTEGER NOT NULL,
    "language" TEXT,
    "discipline" TEXT,
    "primary_skill" TEXT,
    "selected_letter" TEXT NOT NULL,
    "correct_letter" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enem_question_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_learning_paths" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_learning_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_path_steps" (
    "id" UUID NOT NULL,
    "path_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "discipline" TEXT,
    "skill" TEXT,
    "question_key" TEXT NOT NULL,
    "question_year" INTEGER NOT NULL,
    "question_index" INTEGER NOT NULL,
    "question_language" TEXT,
    "status" "LearningPathStepStatus" NOT NULL DEFAULT 'locked',
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "learning_path_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "enem_question_attempts_student_id_answered_at_idx" ON "enem_question_attempts"("student_id", "answered_at");

-- CreateIndex
CREATE UNIQUE INDEX "enem_question_attempts_student_id_question_key_key" ON "enem_question_attempts"("student_id", "question_key");

-- CreateIndex
CREATE INDEX "student_learning_paths_student_id_is_active_idx" ON "student_learning_paths"("student_id", "is_active");

-- CreateIndex
CREATE INDEX "learning_path_steps_path_id_status_idx" ON "learning_path_steps"("path_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "learning_path_steps_path_id_order_index_key" ON "learning_path_steps"("path_id", "order_index");

-- AddForeignKey
ALTER TABLE "enem_question_attempts" ADD CONSTRAINT "enem_question_attempts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_learning_paths" ADD CONSTRAINT "student_learning_paths_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_path_steps" ADD CONSTRAINT "learning_path_steps_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "student_learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;
