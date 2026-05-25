import { z } from "zod";
import { hasDuplicateTeacherClasses } from "@/lib/teacher-class-key";
import {
  getAvailableMaterias,
  isMateriaAvailableForClass,
} from "@/lib/materias-catalog";
import type { TeacherDiscipline } from "@/lib/validations/teacher";
import { TEACHER_DISCIPLINES } from "@/lib/validations/teacher";

const teacherDisciplineSchema = z.enum(TEACHER_DISCIPLINES);

export const teacherClassAssignmentSchema = z.object({
  grade: z.enum(["1", "2", "3"]),
  class_identifier: z.string().min(1, "Selecione a turma"),
  materias: z
    .array(teacherDisciplineSchema)
    .min(1, "Selecione ao menos uma matéria nesta turma"),
});

export const teacherSchoolAssignmentSchema = z.object({
  school_id: z.string().uuid("Selecione uma escola"),
  classes: z
    .array(teacherClassAssignmentSchema)
    .min(1, "Adicione ao menos uma turma nesta escola"),
});

export const teacherAssignmentsSchema = z
  .array(teacherSchoolAssignmentSchema)
  .min(1, "Selecione ao menos uma escola")
  .max(10);

function uniqueTeacherSchools(data: { school_id: string }[]) {
  const ids = data.map((s) => s.school_id);
  return new Set(ids).size === ids.length;
}

function uniqueTeacherClassesPerSchool(data: {
  classes: { grade: string; class_identifier: string }[];
}[]) {
  return data.every((school) => !hasDuplicateTeacherClasses(school.classes));
}

function compatibleMateriasPerClass(data: {
  school_id: string;
  classes: {
    grade: string;
    class_identifier: string;
    materias: string[];
  }[];
}[]) {
  for (const school of data) {
    for (const classEntry of school.classes) {
      for (const materia of classEntry.materias) {
        if (
          !isMateriaAvailableForClass(
            school.school_id,
            classEntry.grade,
            materia
          )
        ) {
          return false;
        }
      }
      const uniqueMaterias = new Set(classEntry.materias);
      if (uniqueMaterias.size !== classEntry.materias.length) {
        return false;
      }
    }
  }
  return true;
}

export const teacherSchoolsPayloadSchema = teacherAssignmentsSchema
  .refine(uniqueTeacherSchools, {
    message: "Cada escola deve ser selecionada apenas uma vez",
  })
  .refine(uniqueTeacherClassesPerSchool, {
    message:
      "Cada combinação de série e turma deve ser selecionada apenas uma vez por escola",
  })
  .refine(compatibleMateriasPerClass, {
    message:
      "Selecione apenas matérias compatíveis com a escola e a série escolhidas",
  });

export const updateTeacherAssignmentsSchema = z.object({
  schools: teacherSchoolsPayloadSchema,
});

export type TeacherClassAssignmentInput = z.infer<
  typeof teacherClassAssignmentSchema
>;
export type TeacherSchoolAssignmentInput = z.infer<
  typeof teacherSchoolAssignmentSchema
>;
export type TeacherSchoolsPayload = z.infer<typeof teacherSchoolsPayloadSchema>;

export function defaultMateriasForClass(
  schoolId: string,
  grade: string
): TeacherDiscipline[] {
  const available = getAvailableMaterias(schoolId, grade);
  return available.length > 0 ? [available[0]!] : ["Matemática"];
}
