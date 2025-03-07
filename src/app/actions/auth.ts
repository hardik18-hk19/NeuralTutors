"use server";

import crypto from "crypto";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

// Types and Interfaces
export type UserRole = "school" | "teacher" | "student";

interface JwtPayload {
  id: string;
  role: UserRole;
  schoolId?: string;
  teacherId?: string;
  studentId?: string;
  reset?: boolean;
  email?: string;
  verificationCode?: string;
  codeExpiry?: number;
  verified?: boolean;
  [key: string]: unknown;
}

interface BaseResponse {
  success?: boolean;
  error?: string;
}

interface RegistrationResponse<T> extends BaseResponse {
  data?: T;
  token?: string;
}

interface LoginResponse extends BaseResponse {
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

interface ResetPasswordResponse extends BaseResponse {
  token?: string;
}

interface VerificationResponse extends BaseResponse {
  verificationCode?: string; // For development only, remove in production
  token?: string;
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

// Configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);
const JWT_EXPIRES_IN = "7d"; // 7 days for "Remember me"
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 3;
const VERIFICATION_CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; timestamp: number }>();

// Utility Functions
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

function generateSchoolId(schoolName: string): string {
  console.log("Generating school ID for:", schoolName);
  // Remove any spaces from the school name first
  const cleanName = schoolName.replace(/\s+/g, "");
  const firstThree = cleanName.substring(0, 3).toUpperCase();
  const randomNum = Math.floor(Math.random() * 10000);
  const paddedNum = randomNum.toString().padStart(4, "0");
  const schoolId = `${firstThree}${paddedNum}`;
  console.log("Generated school ID:", {
    firstThree,
    randomNum,
    paddedNum,
    schoolId,
  });
  return schoolId;
}

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(email);

  if (!userLimit) {
    rateLimitStore.set(email, { count: 1, timestamp: now });
    return true;
  }

  if (now - userLimit.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(email, { count: 1, timestamp: now });
    return true;
  }

  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Token Management
async function createToken(payload: JwtPayload, rememberMe: boolean = false) {
  try {
    console.log("Creating token with payload:", {
      ...payload,
      password: payload.password ? "***" : undefined,
    });

    if (!payload || typeof payload !== "object") {
      console.error("Invalid payload:", payload);
      throw new Error("Invalid payload for token creation");
    }

    // Ensure required fields are present
    if (!payload.id || !payload.role) {
      console.error("Missing required fields in payload:", {
        id: payload.id,
        role: payload.role,
      });
      throw new Error("Missing required fields in token payload");
    }

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(rememberMe ? JWT_EXPIRES_IN : "1d")
      .sign(JWT_SECRET);

    console.log("Token created successfully");
    return token;
  } catch (error) {
    console.error("Token creation error:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    throw new Error("Failed to create token");
  }
}

async function verifyToken(token: string) {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload) {
      throw new Error("Invalid token payload");
    }
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// Database Validation
async function isUserIdTaken(userId: string): Promise<boolean> {
  const [schoolExists, teacherExists, studentExists] = await Promise.all([
    prisma.school.findUnique({ where: { userId } }),
    prisma.teacher.findUnique({ where: { userId } }),
    prisma.student.findUnique({ where: { userId } }),
  ]);

  return !!(schoolExists || teacherExists || studentExists);
}

async function validateSchool(schoolName: string, schoolId: string) {
  return prisma.school.findUnique({
    where: { schoolId },
  });
}

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
    // Create the school first
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

    // Create token with proper payload structure
    const tokenPayload: JwtPayload = {
      id: school.id,
      role: "school" as UserRole,
      schoolId: school.schoolId,
      email: school.email,
    };

    console.log("Creating token with payload:", tokenPayload);
    const token = await createToken(tokenPayload);
    console.log("Token created successfully");

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

    return { success: true };
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

    const tokenPayload: JwtPayload = {
      id: school.id,
      schoolId: school.schoolId,
      role: "school" as UserRole,
    };

    console.log("Creating token with payload:", tokenPayload);
    const token = await createToken(tokenPayload, rememberMe);
    console.log("Token created successfully");

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

    let user;
    switch (role) {
      case "school":
        user = await prisma.school.findFirst({
          where: { id: payload.id as string, email: payload.email as string },
        });
        break;
      case "teacher":
        user = await prisma.teacher.findFirst({
          where: { id: payload.id as string, email: payload.email as string },
        });
        break;
      case "student":
        user = await prisma.student.findFirst({
          where: { id: payload.id as string, email: payload.email as string },
        });
        break;
    }

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

    let user;
    switch (role) {
      case "school":
        user = await prisma.school.findFirst({
          where: { id: payload.id as string, email: payload.email as string },
        });
        break;
      case "teacher":
        user = await prisma.teacher.findFirst({
          where: { id: payload.id as string, email: payload.email as string },
        });
        break;
      case "student":
        user = await prisma.student.findFirst({
          where: { id: payload.id as string, email: payload.email as string },
        });
        break;
    }

    if (!user) {
      return { error: "User not found or invalid reset token" };
    }

    const hashedPassword = await hashPassword(newPassword);

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
