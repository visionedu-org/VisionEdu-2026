import type { Prisma } from "@prisma/client";
import type { User } from "@/types/domain";
import { cargoToRole } from "./cargo";

const userWithStudent = {
  studentProfile: {
    include: {
      school: true,
      class: true,
    },
  },
} as const;

const userWithTeacher = {
  teacherProfile: {
    include: {
      schools: {
        include: {
          school: true,
        },
      },
      assignments: {
        include: {
          class: true,
        },
      },
    },
  },
} as const;

export type UserWithRelations = Prisma.UserGetPayload<{
  include: typeof userWithStudent & typeof userWithTeacher;
}>;

export const userInclude = {
  studentProfile: userWithStudent.studentProfile,
  teacherProfile: userWithTeacher.teacherProfile,
};

export function mapUserToDomain(record: UserWithRelations): User {
  const role = cargoToRole(record.cargo);

  if (role === "student" && record.studentProfile) {
    const sp = record.studentProfile;
    return {
      id: record.id,
      name: record.name,
      email: record.email,
      role: "student",
      city: record.city,
      school_id: sp.schoolId,
      grade: sp.class.grade,
      class_identifier: sp.class.classIdentifier,
    };
  }

  if (role === "teacher" && record.teacherProfile) {
    const tp = record.teacherProfile;
    return {
      id: record.id,
      name: record.name,
      email: record.email,
      role: "teacher",
      city: record.city,
      teacher_schools: tp.schools.map((s) => ({
        school_id: s.schoolId,
        name: s.school.name,
      })),
      teacher_classes: tp.assignments.map((a) => ({
        school_id: a.class.schoolId,
        grade: a.class.grade,
        class_identifier: a.class.classIdentifier,
      })),
    };
  }

  return {
    id: record.id,
    name: record.name,
    email: record.email,
    role,
    city: record.city,
  };
}
