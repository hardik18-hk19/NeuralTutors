"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

// Types and Interfaces
interface JwtPayload {
  id: string;
  role: "school" | "teacher" | "student";
  schoolId?: string;
  teacherId?: string;
  studentId?: string;
  reset?: boolean;
  [key: string]: unknown;
}

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

interface LoginResponse {
  success?: boolean;
  error?: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: "school" | "teacher" | "student";
  };
}

interface ResetPasswordResponse {
  success?: boolean;
  error?: string;
}

// JWT Configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);
const JWT_EXPIRES_IN = "7d"; // 7 days for "Remember me"

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

// Authentication Functions
async function createToken(payload: JwtPayload, rememberMe: boolean = false) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(rememberMe ? JWT_EXPIRES_IN : "1d")
    .sign(JWT_SECRET);
  return token;
}

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// Login Functions
export async function loginSchool(formData: FormData): Promise<LoginResponse> {
  try {
    const schoolId = formData.get("schoolId") as string;
    const password = formData.get("password") as string;
    const rememberMe = formData.get("rememberMe") === "true";

    const school = await prisma.school.findUnique({
      where: { schoolId },
    });

    if (!school) {
      return { error: "School not found" };
    }

    const isValidPassword = await bcrypt.compare(password, school.password);
    if (!isValidPassword) {
      return { error: "Invalid password" };
    }

    const token = await createToken(
      {
        id: school.id,
        schoolId: school.schoolId,
        role: "school",
      },
      rememberMe
    );

    return {
      success: true,
      token,
      user: {
        id: school.id,
        name: school.schoolName,
        email: school.email,
        role: "school",
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Login failed" };
  }
}

export async function loginTeacher(formData: FormData): Promise<LoginResponse> {
  try {
    const teacherId = formData.get("teacherId") as string;
    const password = formData.get("password") as string;
    const rememberMe = formData.get("rememberMe") === "true";

    const teacher = await prisma.teacher.findUnique({
      where: { teacherId },
    });

    if (!teacher) {
      return { error: "Teacher not found" };
    }

    const isValidPassword = await bcrypt.compare(password, teacher.password);
    if (!isValidPassword) {
      return { error: "Invalid password" };
    }

    const token = await createToken(
      {
        id: teacher.id,
        teacherId: teacher.teacherId,
        role: "teacher",
      },
      rememberMe
    );

    return {
      success: true,
      token,
      user: {
        id: teacher.id,
        name: teacher.teacherName,
        email: teacher.email,
        role: "teacher",
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Login failed" };
  }
}

export async function loginStudent(formData: FormData): Promise<LoginResponse> {
  try {
    const studentId = formData.get("studentId") as string;
    const password = formData.get("password") as string;
    const rememberMe = formData.get("rememberMe") === "true";

    const student = await prisma.student.findUnique({
      where: { studentId },
    });

    if (!student) {
      return { error: "Student not found" };
    }

    const isValidPassword = await bcrypt.compare(password, student.password);
    if (!isValidPassword) {
      return { error: "Invalid password" };
    }

    const token = await createToken(
      {
        id: student.id,
        studentId: student.studentId,
        role: "student",
      },
      rememberMe
    );

    return {
      success: true,
      token,
      user: {
        id: student.id,
        name: student.studentName,
        email: student.email,
        role: "student",
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Login failed" };
  }
}

// Password Reset Functions
export async function requestPasswordReset(
  email: string,
  role: "school" | "teacher" | "student"
): Promise<ResetPasswordResponse> {
  try {
    let user;
    switch (role) {
      case "school":
        user = await prisma.school.findUnique({ where: { email } });
        break;
      case "teacher":
        user = await prisma.teacher.findUnique({ where: { email } });
        break;
      case "student":
        user = await prisma.student.findUnique({ where: { email } });
        break;
    }

    if (!user) {
      return { error: "User not found" };
    }

    // Generate reset token
    await createToken(
      {
        id: user.id,
        role,
        reset: true,
      },
      false
    );

    // TODO: Send reset email with token
    // For now, we'll just return success
    return { success: true };
  } catch (error) {
    console.error("Password reset request error:", error);
    return { error: "Failed to request password reset" };
  }
}

export async function resetPassword(
  token: string,
  newPassword: string,
  role: "school" | "teacher" | "student"
): Promise<ResetPasswordResponse> {
  try {
    const payload = await verifyToken(token);
    if (!payload || !payload.reset) {
      return { error: "Invalid or expired reset token" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    switch (role) {
      case "school":
        await prisma.school.update({
          where: { id: payload.id as string },
          data: { password: hashedPassword },
        });
        break;
      case "teacher":
        await prisma.teacher.update({
          where: { id: payload.id as string },
          data: { password: hashedPassword },
        });
        break;
      case "student":
        await prisma.student.update({
          where: { id: payload.id as string },
          data: { password: hashedPassword },
        });
        break;
    }

    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: "Failed to reset password" };
  }
}

// Session Management
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  return payload;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  return { success: true };
}
