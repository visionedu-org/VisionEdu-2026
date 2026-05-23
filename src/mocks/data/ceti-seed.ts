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

function buildClassesForSchool(schoolId: string, idPrefix: string): ClassGroup[] {
  return grades.flatMap((grade) =>
    sections.map((section) => ({
      id: `${idPrefix}-${grade}-${section}`,
      school_id: schoolId,
      grade,
      class_identifier: section,
      label: `${grade}º ano — Turma ${section}`,
    }))
  );
}

export const cetiClasses: ClassGroup[] = buildClassesForSchool(
  CETI_SCHOOL_ID,
  "class-ceti"
);

const emefClasses: ClassGroup[] = buildClassesForSchool(
  EMEF_SCHOOL_ID,
  "class-emef"
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
