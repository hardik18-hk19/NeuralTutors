"use server";

import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/backend/db";
import {
  UserRole,
  LoginResponse,
  RegistrationResponse,
  ResetPasswordResponse,
  VerificationResponse,
  SchoolData,
  TeacherData,
  StudentData,
} from "./types";
import {
  hashPassword,
  generateSchoolId,
  checkRateLimit,
  createToken,
  verifyToken,
  rateLimitStore,
} from "./utils";
import {
  isUserIdTaken,
  validateSchool,
  findUserByEmail,
  findUserByIdAndEmail,
  updateUserPassword,
} from "./db";
import {
  VERIFICATION_CODE_EXPIRY,
  RATE_LIMIT_WINDOW,
  TEST_SCHOOL,
} from "./config";

// Error Handling
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
    console.log("Starting school registration...");

    const schoolName = formData.get("schoolName") as string;
    const userId = formData.get("userId") as string;
    const numStudents = parseInt(formData.get("numStudents") as string);
    const numTeachers = parseInt(formData.get("numTeachers") as string);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log("Form data received:", {
      schoolName,
      userId,
      numStudents,
      numTeachers,
      email,
      password: password ? "***" : undefined,
    });

    if (!schoolName || !userId || !email || !password) {
      console.log("Missing required fields");
      return { error: "All fields are required" };
    }

    // Check if email is already in use
    const existingEmail = await prisma.school.findUnique({
      where: { email },
    });

    if (existingEmail) {
      console.log("Email already in use");
      return {
        error:
          "This email is already registered. Please use a different email address.",
      };
    }

    if (await isUserIdTaken(userId)) {
      console.log("User ID already taken");
      return {
        error: "This User ID is already taken. Please choose a different one.",
      };
    }

    const schoolId = generateSchoolId(schoolName);
    console.log("Generated school ID:", schoolId);
    const hashedPassword = await hashPassword(password);

    console.log("Creating school in database with ID:", schoolId);
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

    console.log("School created:", {
      id: school.id,
      schoolName: school.schoolName,
      schoolId: school.schoolId,
      email: school.email,
    });

    if (!school) {
      console.log("School creation failed");
      throw new Error("Failed to create school");
    }

    const token = await createToken({
      id: school.id,
      role: "school" as UserRole,
      schoolId: school.schoolId,
      email: school.email,
    });

    return {
      success: true,
      token,
      data: {
        id: school.id,
        schoolName: school.schoolName,
        schoolId: school.schoolId,
        email: school.email,
      },
    };
  } catch (error) {
    console.error("School registration error:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
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

// Login Functions
export async function loginSchool(formData: FormData): Promise<LoginResponse> {
  try {
    console.log("Starting school login process...");

    const schoolId = formData.get("schoolId") as string;
    const password = formData.get("password") as string;
    const rememberMe = formData.get("rememberMe") === "true";

    console.log("Login attempt with:", {
      schoolId,
      password: password ? "***" : undefined,
      rememberMe,
    });

    const school = await prisma.school.findUnique({
      where: { schoolId },
    });

    if (!school) {
      console.log("School not found with ID:", schoolId);
      return { error: "School not found" };
    }

    console.log("School found:", {
      id: school.id,
      schoolName: school.schoolName,
      schoolId: school.schoolId,
      email: school.email,
    });

    const isValidPassword = await bcrypt.compare(password, school.password);
    if (!isValidPassword) {
      console.log("Invalid password for school:", schoolId);
      return { error: "Invalid password" };
    }

    console.log("Password verified successfully");

    const token = await createToken(
      {
        id: school.id,
        schoolId: school.schoolId,
        role: "school" as UserRole,
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
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
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
        role: "teacher" as UserRole,
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
        role: "student" as UserRole,
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
  role: UserRole
): Promise<VerificationResponse> {
  try {
    if (!checkRateLimit(email)) {
      return {
        error: `Too many reset attempts. Please try again in ${Math.ceil(
          (RATE_LIMIT_WINDOW -
            (Date.now() - (rateLimitStore.get(email)?.timestamp || 0))) /
            60000
        )} minutes.`,
      };
    }

    const user = await findUserByEmail(email, role);
    if (!user) {
      return { error: "User not found" };
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const token = await createToken(
      {
        id: user.id,
        email: user.email,
        role,
        reset: true,
        verificationCode,
        codeExpiry: Date.now() + VERIFICATION_CODE_EXPIRY,
      },
      false
    );

    return {
      success: true,
      verificationCode, // Remove this in production
      token,
    };
  } catch (error) {
    console.error("Password reset request error:", error);
    return { error: "Failed to request password reset" };
  }
}

export async function verifyResetCode(
  token: string,
  code: string,
  role: UserRole
): Promise<ResetPasswordResponse> {
  try {
    const payload = await verifyToken(token);
    if (
      !payload ||
      !payload.reset ||
      !payload.email ||
      !payload.verificationCode ||
      !payload.codeExpiry ||
      typeof payload.codeExpiry !== "number"
    ) {
      return { error: "Invalid or expired reset token" };
    }

    if (Date.now() > payload.codeExpiry) {
      return {
        error: "Verification code has expired. Please request a new one.",
      };
    }

    if (payload.verificationCode !== code) {
      return { error: "Invalid verification code" };
    }

    const user = await findUserByIdAndEmail(
      payload.id as string,
      payload.email as string,
      role
    );

    if (!user) {
      return { error: "User not found or invalid reset token" };
    }

    const newToken = await createToken(
      {
        id: user.id,
        email: user.email,
        role,
        reset: true,
        verified: true,
      },
      false
    );

    return {
      success: true,
      token: newToken,
    };
  } catch (error) {
    console.error("Code verification error:", error);
    return { error: "Failed to verify code" };
  }
}

export async function resetPassword(
  token: string,
  newPassword: string,
  role: UserRole
): Promise<ResetPasswordResponse> {
  try {
    const payload = await verifyToken(token);
    if (!payload || !payload.reset || !payload.email || !payload.verified) {
      return { error: "Invalid or expired reset token" };
    }

    const user = await findUserByIdAndEmail(
      payload.id as string,
      payload.email as string,
      role
    );

    if (!user) {
      return { error: "User not found or invalid reset token" };
    }

    const hashedPassword = await hashPassword(newPassword);
    await updateUserPassword(payload.id as string, hashedPassword, role);

    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: "Failed to reset password" };
  }
}

export async function resendVerificationCode(
  token: string,
  role: UserRole
): Promise<VerificationResponse> {
  try {
    const payload = await verifyToken(token);
    if (!payload || !payload.reset || !payload.email) {
      return { error: "Invalid or expired reset token" };
    }

    if (!checkRateLimit(payload.email as string)) {
      return {
        error: `Too many reset attempts. Please try again in ${Math.ceil(
          (RATE_LIMIT_WINDOW -
            (Date.now() -
              (rateLimitStore.get(payload.email as string)?.timestamp || 0))) /
            60000
        )} minutes.`,
      };
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const newToken = await createToken(
      {
        id: payload.id as string,
        email: payload.email as string,
        role,
        reset: true,
        verificationCode,
        codeExpiry: Date.now() + VERIFICATION_CODE_EXPIRY,
      },
      false
    );

    return {
      success: true,
      verificationCode, // Remove this in production
      token: newToken,
    };
  } catch (error) {
    console.error("Resend code error:", error);
    return { error: "Failed to resend verification code" };
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

// Test School Management
export async function createTestSchool() {
  try {
    const school = await prisma.school.create({
      data: {
        schoolName: TEST_SCHOOL.name,
        schoolId: TEST_SCHOOL.id,
        userId: TEST_SCHOOL.userId,
        email: TEST_SCHOOL.email,
        password: await hashPassword("test123"),
        numStudents: 100,
        numTeachers: 10,
      },
    });

    return { success: true, data: school };
  } catch (error) {
    console.error("Test school creation error:", error);
    return { error: "Failed to create test school" };
  }
}

export async function deleteTestSchool() {
  try {
    await prisma.school.delete({
      where: { schoolId: TEST_SCHOOL.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Test school deletion error:", error);
    return { error: "Failed to delete test school" };
  }
}
