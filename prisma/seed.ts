import { PrismaClient, Cargo } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const APRIGIO_SCHOOL_ID = "d3b07384-d113-4956-a5cc-9c6f2c3d526e";
const SERAFIM_SCHOOL_ID = "e4c18495-e224-5067-b6dd-0d7f3e4d637f";
const JOSE_ALVES_SCHOOL_ID = "c5d29506-f335-4178-a7ee-1e8f4f5e7480";
const UBIRACI_SCHOOL_ID = "d6f40628-f557-4390-b9ff-3f0f6f7f9602";
const DEMO_STUDENT_ID = "4a7174e2-6cf0-449e-b98a-4933934375b4";
const DEMO_TEACHER_ID = "8f3c2a1b-9d4e-4f5a-b6c7-8d9e0f1a2b3c";

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

async function seedSchoolWithClasses(
  school: { id: string; name: string; city: string },
  classIds: Record<string, string>
) {
  await prisma.school.upsert({
    where: { id: school.id },
    update: { name: school.name, city: school.city },
    create: {
      id: school.id,
      name: school.name,
      gre: "16ª GRE",
      city: school.city,
    },
  });

  for (const grade of grades) {
    for (const section of sections) {
      const key = `${grade}-${section}`;
      await prisma.classGroup.upsert({
        where: {
          schoolId_grade_classIdentifier: {
            schoolId: school.id,
            grade,
            classIdentifier: section,
          },
        },
        update: { label: `${grade}º ano — Turma ${section}` },
        create: {
          id: classIds[key],
          schoolId: school.id,
          grade,
          classIdentifier: section,
          label: `${grade}º ano — Turma ${section}`,
        },
      });
    }
  }
}

async function main() {
  await seedSchoolWithClasses(
    {
      id: APRIGIO_SCHOOL_ID,
      name: "CETI Aprigio Pereira Bezerra",
      city: "São Julião, PI",
    },
    APRIGIO_CLASS_IDS
  );

  await seedSchoolWithClasses(
    {
      id: SERAFIM_SCHOOL_ID,
      name: "CETI Serafim José de Brito",
      city: "Campo Grande do Piauí, PI",
    },
    SERAFIM_CLASS_IDS
  );

  await seedSchoolWithClasses(
    {
      id: JOSE_ALVES_SCHOOL_ID,
      name: "CETI José Alves Bezerra",
      city: "Monsenhor Hipólito, PI",
    },
    JOSE_ALVES_CLASS_IDS
  );

  await seedSchoolWithClasses(
    {
      id: UBIRACI_SCHOOL_ID,
      name: "CETI Luiz Ubiraci de Carvalho",
      city: "Vila Nova do Piauí, PI",
    },
    UBIRACI_CLASS_IDS
  );

  const demoPassword = await bcrypt.hash("senhaDemo123", 12);

  await prisma.user.upsert({
    where: { email: "thiago.demo@escola.pi.gov.br" },
    update: { city: "São Julião" },
    create: {
      id: DEMO_STUDENT_ID,
      email: "thiago.demo@escola.pi.gov.br",
      passwordHash: demoPassword,
      name: "Thiago Silva (demo)",
      city: "São Julião",
      cargo: Cargo.estudante,
      studentProfile: {
        create: {
          schoolId: APRIGIO_SCHOOL_ID,
          classId: APRIGIO_CLASS_IDS["2-A"],
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "regina.demo@escola.pi.gov.br" },
    update: { city: "São Julião" },
    create: {
      id: DEMO_TEACHER_ID,
      email: "regina.demo@escola.pi.gov.br",
      passwordHash: demoPassword,
      name: "Professora Regina (demo)",
      city: "São Julião",
      cargo: Cargo.professor,
      teacherProfile: {
        create: {
          schools: {
            create: [{ schoolId: APRIGIO_SCHOOL_ID }],
          },
          assignments: {
            create: [
              { classId: APRIGIO_CLASS_IDS["2-A"] },
              { classId: APRIGIO_CLASS_IDS["2-B"] },
            ],
          },
          classMaterias: {
            create: [
              {
                classId: APRIGIO_CLASS_IDS["2-A"],
                schoolId: APRIGIO_SCHOOL_ID,
                materia: "Matemática",
              },
              {
                classId: APRIGIO_CLASS_IDS["2-A"],
                schoolId: APRIGIO_SCHOOL_ID,
                materia: "Português",
              },
              {
                classId: APRIGIO_CLASS_IDS["2-B"],
                schoolId: APRIGIO_SCHOOL_ID,
                materia: "Matemática",
              },
              {
                classId: APRIGIO_CLASS_IDS["2-B"],
                schoolId: APRIGIO_SCHOOL_ID,
                materia: "Português",
              },
            ],
          },
        },
      },
    },
  });

  const demoTeacher = await prisma.teacherProfile.findFirst({
    where: { user: { email: "regina.demo@escola.pi.gov.br" } },
    select: { id: true },
  });

  if (demoTeacher) {
    await prisma.teacherClassMateria.deleteMany({
      where: { teacherId: demoTeacher.id },
    });
    await prisma.teacherClassMateria.createMany({
      data: [
        {
          teacherId: demoTeacher.id,
          classId: APRIGIO_CLASS_IDS["2-A"],
          schoolId: APRIGIO_SCHOOL_ID,
          materia: "Matemática",
        },
        {
          teacherId: demoTeacher.id,
          classId: APRIGIO_CLASS_IDS["2-A"],
          schoolId: APRIGIO_SCHOOL_ID,
          materia: "Português",
        },
        {
          teacherId: demoTeacher.id,
          classId: APRIGIO_CLASS_IDS["2-B"],
          schoolId: APRIGIO_SCHOOL_ID,
          materia: "Matemática",
        },
        {
          teacherId: demoTeacher.id,
          classId: APRIGIO_CLASS_IDS["2-B"],
          schoolId: APRIGIO_SCHOOL_ID,
          materia: "Português",
        },
      ],
      skipDuplicates: true,
    });
  }
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
