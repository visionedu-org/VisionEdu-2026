-- CreateTable
CREATE TABLE "teacher_class_materias" (
    "teacher_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "materia" TEXT NOT NULL,

    CONSTRAINT "teacher_class_materias_pkey" PRIMARY KEY ("teacher_id","class_id","materia")
);

-- CreateIndex
CREATE INDEX "teacher_class_materias_teacher_id_school_id_idx" ON "teacher_class_materias"("teacher_id", "school_id");

-- AddForeignKey
ALTER TABLE "teacher_class_materias" ADD CONSTRAINT "teacher_class_materias_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_class_materias" ADD CONSTRAINT "teacher_class_materias_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_class_materias" ADD CONSTRAINT "teacher_class_materias_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
