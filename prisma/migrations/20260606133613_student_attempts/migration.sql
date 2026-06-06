-- CreateEnum
CREATE TYPE "AttemptSource" AS ENUM ('practice', 'learning_path', 'material');

-- AlterTable
ALTER TABLE "enem_question_attempts" ADD COLUMN     "source" "AttemptSource" NOT NULL DEFAULT 'practice';
