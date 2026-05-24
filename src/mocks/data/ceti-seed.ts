import type { ClassGroup, School, User } from "@/types/domain";

export const CETI_SCHOOL_ID = "d3b07384-d113-4956-a5cc-9c6f2c3d526e";
const EMEF_SCHOOL_ID = "e4c18495-e224-5067-b6dd-0d7f3e4d637f";

export const cetiSchool: School = {
  id: CETI_SCHOOL_ID,
  name: "CETI Luiz Ubiraci de Carvalho",
  gre: "16ª GRE",
  city: "Vila Nova do Piauí, PI",
};

const emefSchool: School = {
  id: EMEF_SCHOOL_ID,
  name: "EMEF João Batista de Sousa",
  gre: "16ª GRE",
  city: "Vila Nova do Piauí, PI",
};

export const pilotSchools: School[] = [cetiSchool, emefSchool];

const grades = ["1", "2", "3"] as const;
const sections = ["A", "B"] as const;

/** IDs alinhados ao seed Prisma (`prisma/seed.ts`). */
const CETI_CLASS_IDS: Record<string, string> = {
  "1-A": "a1111111-1111-4111-8111-111111111101",
  "1-B": "a1111111-1111-4111-8111-111111111102",
  "2-A": "a1111111-1111-4111-8111-111111111201",
  "2-B": "a1111111-1111-4111-8111-111111111202",
  "3-A": "a1111111-1111-4111-8111-111111111301",
  "3-B": "a1111111-1111-4111-8111-111111111302",
};

const EMEF_CLASS_IDS: Record<string, string> = {
  "1-A": "b2222222-2222-4222-8222-222222222101",
  "1-B": "b2222222-2222-4222-8222-222222222102",
  "2-A": "b2222222-2222-4222-8222-222222222201",
  "2-B": "b2222222-2222-4222-8222-222222222202",
  "3-A": "b2222222-2222-4222-8222-222222222301",
  "3-B": "b2222222-2222-4222-8222-222222222302",
};

function buildClassesForSchool(
  schoolId: string,
  classIds: Record<string, string>
): ClassGroup[] {
  return grades.flatMap((grade) =>
    sections.map((section) => {
      const key = `${grade}-${section}`;
      return {
        id: classIds[key]!,
        school_id: schoolId,
        grade,
        class_identifier: section,
        label: `${grade}º ano — Turma ${section}`,
      };
    })
  );
}

export const cetiClasses: ClassGroup[] = buildClassesForSchool(
  CETI_SCHOOL_ID,
  CETI_CLASS_IDS
);

const emefClasses: ClassGroup[] = buildClassesForSchool(
  EMEF_SCHOOL_ID,
  EMEF_CLASS_IDS
);

export const pilotClasses: ClassGroup[] = [...cetiClasses, ...emefClasses];

export const DEMO_STUDENT_EMAIL = "thiago.demo@escola.pi.gov.br";
export const DEMO_STUDENT_PASSWORD = "senhaDemo123";
const DEMO_TEACHER_EMAIL = "regina.demo@escola.pi.gov.br";

const demoStudent: User = {
  id: "4a7174e2-6cf0-449e-b98a-4933934375b4",
  name: "Thiago Silva (demo)",
  email: DEMO_STUDENT_EMAIL,
  role: "student",
  city: "Vila Nova do Piauí",
  school_id: CETI_SCHOOL_ID,
  grade: "2",
  class_identifier: "A",
};

const demoTeacher: User = {
  id: "8f3c2a1b-9d4e-4f5a-b6c7-8d9e0f1a2b3c",
  name: "Professora Regina (demo)",
  email: DEMO_TEACHER_EMAIL,
  role: "teacher",
  city: "Vila Nova do Piauí",
  teacher_schools: [
    { school_id: CETI_SCHOOL_ID, name: cetiSchool.name },
  ],
  teacher_classes: [
    { school_id: CETI_SCHOOL_ID, grade: "2", class_identifier: "A" },
    { school_id: CETI_SCHOOL_ID, grade: "2", class_identifier: "B" },
  ],
};

export const seedUsers: User[] = [demoStudent, demoTeacher];
