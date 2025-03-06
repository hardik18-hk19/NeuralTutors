"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export async function registerTeacher(formData: FormData) {
  try {
    const teacherName = formData.get("teacherName") as string;
    const teacherId = formData.get("teacherId") as string;
    const schoolName = formData.get("schoolName") as string;
    const schoolId = formData.get("schoolId") as string;
    const userId = formData.get("userId") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // First, validate if the school exists
    const school = await prisma.school.findFirst({
      where: {
        AND: [{ schoolName: schoolName }, { schoolId: schoolId }],
      },
    });

    if (!school) {
      return {
        error: "School not found. Please verify school name and ID.",
      };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the teacher
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
      teacher: {
        id: teacher.id,
        teacherName: teacher.teacherName,
        teacherId: teacher.teacherId,
        email: teacher.email,
      },
    };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return {
        error: "A teacher with this ID or email already exists.",
      };
    }

    console.error("Error registering teacher:", error);
    return {
      error: "Failed to register teacher",
    };
  }
}
