import type { ClassGroup, School, User } from "@/types/domain";
import type { ActivityCity } from "@/lib/constants/activity-cities";

/** CETI Aprigio Pereira Bezerra — São Julião */
export const APRIGIO_SCHOOL_ID = "d3b07384-d113-4956-a5cc-9c6f2c3d526e";
/** CETI Serafim José de Brito — Campo Grande do Piauí */
export const SERAFIM_SCHOOL_ID = "e4c18495-e224-5067-b6dd-0d7f3e4d637f";
/** CETI José Alves Bezerra — Monsenhor Hipólito */
export const JOSE_ALVES_SCHOOL_ID = "c5d29506-f335-4178-a7ee-1e8f4f5e7480";
/** CETI Luiz Ubiraci de Carvalho — Vila Nova do Piauí */
export const UBIRACI_SCHOOL_ID = "d6f40628-f557-4390-b9ff-3f0f6f7f9602";

/** @deprecated Use APRIGIO_SCHOOL_ID */
export const CETI_SCHOOL_ID = APRIGIO_SCHOOL_ID;

const SCHOOL_ACTIVITY_CITY: Record<string, ActivityCity> = {
  [APRIGIO_SCHOOL_ID]: "São Julião",
  [SERAFIM_SCHOOL_ID]: "Campo Grande do Piauí",
  [JOSE_ALVES_SCHOOL_ID]: "Monsenhor Hipólito",
  [UBIRACI_SCHOOL_ID]: "Vila Nova do Piauí",
};

export const aprigioSchool: School = {
  id: APRIGIO_SCHOOL_ID,
  name: "CETI Aprigio Pereira Bezerra",
  gre: "16ª GRE",
  city: "São Julião, PI",
};

export const serafimSchool: School = {
  id: SERAFIM_SCHOOL_ID,
  name: "CETI Serafim José de Brito",
  gre: "16ª GRE",
  city: "Campo Grande do Piauí, PI",
};

export const joseAlvesSchool: School = {
  id: JOSE_ALVES_SCHOOL_ID,
  name: "CETI José Alves Bezerra",
  gre: "16ª GRE",
  city: "Monsenhor Hipólito, PI",
};

export const ubiraciSchool: School = {
  id: UBIRACI_SCHOOL_ID,
  name: "CETI Luiz Ubiraci de Carvalho",
  gre: "16ª GRE",
  city: "Vila Nova do Piauí, PI",
};

/** @deprecated Use aprigioSchool */
export const cetiSchool = aprigioSchool;

export const pilotSchools: School[] = [
  aprigioSchool,
  serafimSchool,
  joseAlvesSchool,
  ubiraciSchool,
];

export function getActivityCityForSchool(schoolId: string): ActivityCity | undefined {
  return SCHOOL_ACTIVITY_CITY[schoolId];
}

const grades = ["1", "2", "3"] as const;
const sections = ["A", "B"] as const;

const APRIGIO_CLASS_IDS: Record<string, string> = {
  "1-A": "a1111111-1111-4111-8111-111111111101",
  "1-B": "a1111111-1111-4111-8111-111111111102",
  "2-A": "a1111111-1111-4111-8111-111111111201",
  "2-B": "a1111111-1111-4111-8111-111111111202",
  "3-A": "a1111111-1111-4111-8111-111111111301",
  "3-B": "a1111111-1111-4111-8111-111111111302",
};

const SERAFIM_CLASS_IDS: Record<string, string> = {
  "1-A": "b2222222-2222-4222-8222-222222222101",
  "1-B": "b2222222-2222-4222-8222-222222222102",
  "2-A": "b2222222-2222-4222-8222-222222222201",
  "2-B": "b2222222-2222-4222-8222-222222222202",
  "3-A": "b2222222-2222-4222-8222-222222222301",
  "3-B": "b2222222-2222-4222-8222-222222222302",
};

const JOSE_ALVES_CLASS_IDS: Record<string, string> = {
  "1-A": "c3333333-3333-4333-8333-333333333101",
  "1-B": "c3333333-3333-4333-8333-333333333102",
  "2-A": "c3333333-3333-4333-8333-333333333201",
  "2-B": "c3333333-3333-4333-8333-333333333202",
  "3-A": "c3333333-3333-4333-8333-333333333301",
  "3-B": "c3333333-3333-4333-8333-333333333302",
};

const UBIRACI_CLASS_IDS: Record<string, string> = {
  "1-A": "d4444444-4444-4444-8444-444444444101",
  "1-B": "d4444444-4444-4444-8444-444444444102",
  "2-A": "d4444444-4444-4444-8444-444444444201",
  "2-B": "d4444444-4444-4444-8444-444444444202",
  "3-A": "d4444444-4444-4444-8444-444444444301",
  "3-B": "d4444444-4444-4444-8444-444444444302",
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

export const aprigioClasses: ClassGroup[] = buildClassesForSchool(
  APRIGIO_SCHOOL_ID,
  APRIGIO_CLASS_IDS
);

export const serafimClasses: ClassGroup[] = buildClassesForSchool(
  SERAFIM_SCHOOL_ID,
  SERAFIM_CLASS_IDS
);

export const joseAlvesClasses: ClassGroup[] = buildClassesForSchool(
  JOSE_ALVES_SCHOOL_ID,
  JOSE_ALVES_CLASS_IDS
);

export const ubiraciClasses: ClassGroup[] = buildClassesForSchool(
  UBIRACI_SCHOOL_ID,
  UBIRACI_CLASS_IDS
);

/** @deprecated Use aprigioClasses */
export const cetiClasses = aprigioClasses;

export const pilotClasses: ClassGroup[] = [
  ...aprigioClasses,
  ...serafimClasses,
  ...joseAlvesClasses,
  ...ubiraciClasses,
];

export const DEMO_STUDENT_EMAIL = "thiago.demo@escola.pi.gov.br";
export const DEMO_STUDENT_PASSWORD = "senhaDemo123";
const DEMO_TEACHER_EMAIL = "regina.demo@escola.pi.gov.br";

const demoStudent: User = {
  id: "4a7174e2-6cf0-449e-b98a-4933934375b4",
  name: "Thiago Silva (demo)",
  email: DEMO_STUDENT_EMAIL,
  role: "student",
  city: "São Julião",
  school_id: APRIGIO_SCHOOL_ID,
  grade: "2",
  class_identifier: "A",
};

const demoTeacher: User = {
  id: "8f3c2a1b-9d4e-4f5a-b6c7-8d9e0f1a2b3c",
  name: "Professora Regina (demo)",
  email: DEMO_TEACHER_EMAIL,
  role: "teacher",
  city: "São Julião",
  teacher_schools: [{ school_id: APRIGIO_SCHOOL_ID, name: aprigioSchool.name }],
  teacher_classes: [
    {
      school_id: APRIGIO_SCHOOL_ID,
      grade: "2",
      class_identifier: "A",
      class_id: APRIGIO_CLASS_IDS["2-A"]!,
      materias: ["Matemática", "Português"],
    },
    {
      school_id: APRIGIO_SCHOOL_ID,
      grade: "2",
      class_identifier: "B",
      class_id: APRIGIO_CLASS_IDS["2-B"]!,
      materias: ["Matemática", "Português"],
    },
  ],
};

export const seedUsers: User[] = [demoStudent, demoTeacher];
