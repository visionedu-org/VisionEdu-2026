import { contentFormSchema } from "../src/lib/validations/teacher";

const CLASS_ID = "a1111111-1111-4111-8111-111111111201";
const SCHOOL_ID = "d3b07384-d113-4956-a5cc-9c6f2c3d526e";
const STUDENT_ID = "4a7174e2-6cf0-449e-b98a-4933934375b4";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function basePayload() {
  return {
    title: "Material de teste",
    description: "Descrição do material",
    subject: "Matemática" as const,
    schoolId: SCHOOL_ID,
    grade: "2" as const,
    classId: CLASS_ID,
    contentType: "text" as const,
    bodyText: "Conteúdo",
  };
}

const classModeEmptyStudent = contentFormSchema.safeParse({
  ...basePayload(),
  recipientMode: "class",
  studentId: "",
});

assert(
  classModeEmptyStudent.success,
  `Turma inteira com studentId vazio deve passar. Erro: ${JSON.stringify(classModeEmptyStudent.error?.flatten())}`
);

const classModeUndefinedStudent = contentFormSchema.safeParse({
  ...basePayload(),
  recipientMode: "class",
});

assert(
  classModeUndefinedStudent.success,
  "Turma inteira sem studentId deve passar"
);

const studentModeMissing = contentFormSchema.safeParse({
  ...basePayload(),
  recipientMode: "student",
  studentId: "",
});

assert(!studentModeMissing.success, "Aluno específico sem studentId deve falhar");

const studentModeValid = contentFormSchema.safeParse({
  ...basePayload(),
  recipientMode: "student",
  studentId: STUDENT_ID,
});

assert(
  studentModeValid.success,
  `Aluno específico com UUID válido deve passar. Erro: ${JSON.stringify(studentModeValid.error?.flatten())}`
);

console.log("contentFormSchema: todos os cenários de destinatário passaram.");
