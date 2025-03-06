"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

// Types and Interfaces
interface RegistrationResponse<T> {
  success?: boolean;
  error?: string;
  data?: T;
}

interface SchoolData {
  id: string;
  schoolName: string;
  schoolId: string;
  email: string;
}

interface TeacherData {
  id: string;
  teacherName: string;
  teacherId: string;
  email: string;
}

interface StudentData {
  id: string;
  studentName: string;
  studentId: string;
  email: string;
}

// Validation Functions
async function isUserIdTaken(userId: string): Promise<boolean> {
  const [schoolExists, teacherExists, studentExists] = await Promise.all([
    prisma.school.findUnique({ where: { userId } }),
    prisma.teacher.findUnique({ where: { userId } }),
    prisma.student.findUnique({ where: { userId } }),
  ]);

  return !!(schoolExists || teacherExists || studentExists);
}

async function validateSchool(schoolName: string, schoolId: string) {
  const school = await prisma.school.findFirst({
    where: {
      AND: [{ schoolName }, { schoolId }],
    },
  });

  return school;
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

function generateSchoolId(schoolName: string): string {
  return `${schoolName.substring(0, 3).toUpperCase()}${Math.floor(
    Math.random() * 10000
  )
    .toString()
    .padStart(4, "0")}`;
}

function handleDatabaseError(error: unknown): RegistrationResponse<never> {
  console.error("Full error details:", error);

  if (error instanceof Error && "code" in error && error.code === "P2002") {
    return {
      error: "A unique constraint was violated (ID or email already exists).",
    };
  }

  console.error("Database error:", error);
  return { error: "An unexpected error occurred during registration." };
}

// Registration Functions
export async function registerSchool(
  formData: FormData
): Promise<RegistrationResponse<SchoolData>> {
  try {
    const schoolName = formData.get("schoolName") as string;
    const userId = formData.get("userId") as string;
    const numStudents = parseInt(formData.get("numStudents") as string);
    const numTeachers = parseInt(formData.get("numTeachers") as string);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (await isUserIdTaken(userId)) {
      return {
        error: "This User ID is already taken. Please choose a different one.",
      };
    }

    const schoolId = generateSchoolId(schoolName);
    const hashedPassword = await hashPassword(password);

    const school = await prisma.school.create({
      data: {
        schoolName,
        schoolId,
        userId,
        numStudents,
        numTeachers,
        email,
        password: hashedPassword,
      },
    });

    return {
      success: true,
      data: {
        id: school.id,
        schoolName: school.schoolName,
        schoolId: school.schoolId,
        email: school.email,
      },
    };
  } catch (error) {
    return handleDatabaseError(error);
  }
}

export async function registerTeacher(
  formData: FormData
): Promise<RegistrationResponse<TeacherData>> {
  try {
    const teacherName = formData.get("teacherName") as string;
    const teacherId = formData.get("teacherId") as string;
    const schoolName = formData.get("schoolName") as string;
    const schoolId = formData.get("schoolId") as string;
    const userId = formData.get("userId") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (await isUserIdTaken(userId)) {
      return {
        error: "This User ID is already taken. Please choose a different one.",
      };
    }

    const school = await validateSchool(schoolName, schoolId);
    if (!school) {
      return { error: "School not found. Please verify school name and ID." };
    }

    const hashedPassword = await hashPassword(password);

    const teacher = await prisma.teacher.create({
      data: {
        teacherName,
        teacherId,
        userId,
        email,
        password: hashedPassword,
        schoolId,
        schoolName,
      },
    });

    return {
      success: true,
      data: {
        id: teacher.id,
        teacherName: teacher.teacherName,
        teacherId: teacher.teacherId,
        email: teacher.email,
      },
    };
  } catch (error) {
    return handleDatabaseError(error);
  }
}

export async function registerStudent(
  formData: FormData
): Promise<RegistrationResponse<StudentData>> {
  try {
    const studentName = formData.get("studentName") as string;
    const studentId = formData.get("studentId") as string;
    const schoolName = formData.get("schoolName") as string;
    const schoolId = formData.get("schoolId") as string;
    const userId = formData.get("userId") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (await isUserIdTaken(userId)) {
      return {
        error: "This User ID is already taken. Please choose a different one.",
      };
    }

    const school = await validateSchool(schoolName, schoolId);
    if (!school) {
      return { error: "School not found. Please verify school name and ID." };
    }

    const hashedPassword = await hashPassword(password);

    const student = await prisma.student.create({
      data: {
        studentName,
        studentId,
        userId,
        email,
        password: hashedPassword,
        schoolId,
        schoolName,
      },
    });

    return {
      success: true,
      data: {
        id: student.id,
        studentName: student.studentName,
        studentId: student.studentId,
        email: student.email,
      },
    };
  } catch (error) {
    return handleDatabaseError(error);
  }
}

// Test School Management
const TEST_SCHOOL = {
  name: "Test School",
  id: crypto.randomUUID().substring(0, 8).toUpperCase(),
  userId: "test_user",
  email: "test@example.com",
};

export async function createTestSchool(): Promise<
  RegistrationResponse<SchoolData>
> {
  try {
    const school = await prisma.school.create({
      data: {
        schoolName: TEST_SCHOOL.name,
        schoolId: TEST_SCHOOL.id,
        userId: TEST_SCHOOL.userId,
        numStudents: 100,
        numTeachers: 10,
        email: TEST_SCHOOL.email,
        password: await hashPassword("Test@123"),
      },
    });

    return {
      success: true,
      data: {
        id: school.id,
        schoolName: school.schoolName,
        schoolId: school.schoolId,
        email: school.email,
      },
    };
  } catch (error) {
    return handleDatabaseError(error);
  }
}

export async function deleteTestSchool(): Promise<RegistrationResponse<never>> {
  try {
    await Promise.all([
      prisma.teacher.deleteMany({ where: { schoolId: TEST_SCHOOL.id } }),
      prisma.student.deleteMany({ where: { schoolId: TEST_SCHOOL.id } }),
    ]);

    await prisma.school.delete({
      where: { schoolId: TEST_SCHOOL.id },
    });

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return handleDatabaseError(error);
  }
}
