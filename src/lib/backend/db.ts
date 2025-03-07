import { PrismaClient } from "@prisma/client";
import { UserRole } from "./types";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function isUserIdTaken(userId: string): Promise<boolean> {
  const [schoolExists, teacherExists, studentExists] = await Promise.all([
    prisma.school.findUnique({ where: { userId } }),
    prisma.teacher.findUnique({ where: { userId } }),
    prisma.student.findUnique({ where: { userId } }),
  ]);

  return !!(schoolExists || teacherExists || studentExists);
}

export async function validateSchool(schoolName: string, schoolId: string) {
  return prisma.school.findUnique({
    where: { schoolId },
  });
}

export async function findUserByEmail(email: string, role: UserRole) {
  switch (role) {
    case "school":
      return prisma.school.findUnique({ where: { email } });
    case "teacher":
      return prisma.teacher.findUnique({ where: { email } });
    case "student":
      return prisma.student.findUnique({ where: { email } });
  }
}

export async function findUserByIdAndEmail(
  id: string,
  email: string,
  role: UserRole
) {
  switch (role) {
    case "school":
      return prisma.school.findFirst({
        where: { id, email },
      });
    case "teacher":
      return prisma.teacher.findFirst({
        where: { id, email },
      });
    case "student":
      return prisma.student.findFirst({
        where: { id, email },
      });
  }
}

export async function updateUserPassword(
  id: string,
  hashedPassword: string,
  role: UserRole
) {
  switch (role) {
    case "school":
      return prisma.school.update({
        where: { id },
        data: { password: hashedPassword },
      });
    case "teacher":
      return prisma.teacher.update({
        where: { id },
        data: { password: hashedPassword },
      });
    case "student":
      return prisma.student.update({
        where: { id },
        data: { password: hashedPassword },
      });
  }
}
