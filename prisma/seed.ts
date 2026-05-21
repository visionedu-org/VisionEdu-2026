import { PrismaClient, Cargo } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CETI_SCHOOL_ID = "d3b07384-d113-4956-a5cc-9c6f2c3d526e";
const EMEF_SCHOOL_ID = "e4c18495-e224-5067-b6dd-0d7f3e4d637f";
const DEMO_STUDENT_ID = "4a7174e2-6cf0-449e-b98a-4933934375b4";
const DEMO_TEACHER_ID = "8f3c2a1b-9d4e-4f5a-b6c7-8d9e0f1a2b3c";

const grades = ["1", "2", "3"] as const;
const sections = ["A", "B"] as const;

const CLASS_IDS: Record<string, string> = {
  "1-A": "a1111111-1111-4111-8111-111111111101",
  "1-B": "a1111111-1111-4111-8111-111111111102",
  "2-A": "a1111111-1111-4111-8111-111111111201",
  "2-B": "a1111111-1111-4111-8111-111111111202",
  "3-A": "a1111111-1111-4111-8111-111111111301",
  "3-B": "a1111111-1111-4111-8111-111111111302",
};

async function main() {
  await prisma.school.upsert({
    where: { id: CETI_SCHOOL_ID },
    update: {},
    create: {
      id: CETI_SCHOOL_ID,
      name: "CETI Luiz Ubiraci de Carvalho",
      gre: "16ª GRE",
      city: "Vila Nova do Piauí, PI",
    },
  });

  await prisma.school.upsert({
    where: { id: EMEF_SCHOOL_ID },
    update: {},
    create: {
      id: EMEF_SCHOOL_ID,
      name: "EMEF João Batista de Sousa",
      gre: "16ª GRE",
      city: "Vila Nova do Piauí, PI",
    },
  });

  const EMEF_CLASS_IDS: Record<string, string> = {
    "1-A": "b2222222-2222-4222-8222-222222222101",
    "1-B": "b2222222-2222-4222-8222-222222222102",
    "2-A": "b2222222-2222-4222-8222-222222222201",
    "2-B": "b2222222-2222-4222-8222-222222222202",
    "3-A": "b2222222-2222-4222-8222-222222222301",
    "3-B": "b2222222-2222-4222-8222-222222222302",
  };

  for (const grade of grades) {
    for (const section of sections) {
      const key = `${grade}-${section}`;
      await prisma.classGroup.upsert({
        where: {
          schoolId_grade_classIdentifier: {
            schoolId: CETI_SCHOOL_ID,
            grade,
            classIdentifier: section,
          },
        },
        update: { label: `${grade}º ano — Turma ${section}` },
        create: {
          id: CLASS_IDS[key],
          schoolId: CETI_SCHOOL_ID,
          grade,
          classIdentifier: section,
          label: `${grade}º ano — Turma ${section}`,
        },
      });
      await prisma.classGroup.upsert({
        where: {
          schoolId_grade_classIdentifier: {
            schoolId: EMEF_SCHOOL_ID,
            grade,
            classIdentifier: section,
          },
        },
        update: { label: `${grade}º ano — Turma ${section}` },
        create: {
          id: EMEF_CLASS_IDS[key],
          schoolId: EMEF_SCHOOL_ID,
          grade,
          classIdentifier: section,
          label: `${grade}º ano — Turma ${section}`,
        },
      });
    }
  }

  const demoPassword = await bcrypt.hash("senhaDemo123", 12);

  await prisma.user.upsert({
    where: { email: "thiago.demo@escola.pi.gov.br" },
    update: {},
    create: {
      id: DEMO_STUDENT_ID,
      email: "thiago.demo@escola.pi.gov.br",
      passwordHash: demoPassword,
      name: "Thiago Silva (demo)",
      city: "Vila Nova do Piauí",
      cargo: Cargo.estudante,
      studentProfile: {
        create: {
          schoolId: CETI_SCHOOL_ID,
          classId: CLASS_IDS["2-A"],
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "regina.demo@escola.pi.gov.br" },
    update: {},
    create: {
      id: DEMO_TEACHER_ID,
      email: "regina.demo@escola.pi.gov.br",
      passwordHash: demoPassword,
      name: "Professora Regina (demo)",
      city: "Vila Nova do Piauí",
      cargo: Cargo.professor,
      teacherProfile: {
        create: {
          schools: {
            create: [{ schoolId: CETI_SCHOOL_ID }],
          },
          assignments: {
            create: [
              { classId: CLASS_IDS["2-A"] },
              { classId: CLASS_IDS["2-B"] },
            ],
          },
        },
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
