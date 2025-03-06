"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export async function createTestSchool() {
  try {
    const school = await prisma.school.create({
      data: {
        schoolName: "Test School",
        schoolId: "TEST001",
        userId: "school_test001",
        numStudents: 100,
        numTeachers: 10,
        email: "test@school.com",
        password: await bcrypt.hash("Test@123", 10),
      },
    });
    return { success: true, school };
  } catch (error) {
    console.error("Error creating test school:", error);
    return { error: "Failed to create test school" };
  }
}

export async function registerTeacher(formData: FormData) {
  try {
    const teacherName = formData.get("teacherName") as string;
    const teacherId = formData.get("teacherId") as string;
    const schoolName = formData.get("schoolName") as string;
    const schoolId = formData.get("schoolId") as string;
    const userId = formData.get("userId") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log("Received registration data:", {
      teacherName,
      teacherId,
      schoolName,
      schoolId,
      userId,
      email,
      hasPassword: !!password,
    });

    // First, validate if the school exists
    const school = await prisma.school.findFirst({
      where: {
        AND: [{ schoolName: schoolName }, { schoolId: schoolId }],
      },
    });

    console.log("School lookup result:", school ? "Found" : "Not found");

    if (!school) {
      return {
        error: "School not found. Please verify school name and ID.",
      };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the teacher
    const teacher = await prisma.teacher
      .create({
        data: {
          teacherName,
          teacherId,
          userId,
          email,
          password: hashedPassword,
          schoolId,
          schoolName,
        },
      })
      .catch((error) => {
        console.error("Database error:", error);
        throw error;
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
    console.error("Full error details:", error);

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

export async function registerSchool(formData: FormData) {
  try {
    const schoolName = formData.get("schoolName") as string;
    const userId = formData.get("userId") as string;
    const numStudents = parseInt(formData.get("numStudents") as string);
    const numTeachers = parseInt(formData.get("numTeachers") as string);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log("Received school registration data:", {
      schoolName,
      userId,
      numStudents,
      numTeachers,
      email,
      hasPassword: !!password,
    });

    // Generate a unique school ID
    const schoolId = `${schoolName.substring(0, 3).toUpperCase()}${Math.floor(
      Math.random() * 10000
    )
      .toString()
      .padStart(4, "0")}`;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the school
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
      school: {
        id: school.id,
        schoolName: school.schoolName,
        schoolId: school.schoolId,
        email: school.email,
      },
    };
  } catch (error) {
    console.error("Full error details:", error);

    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return {
        error: "A school with this name, ID, or email already exists.",
      };
    }

    console.error("Error registering school:", error);
    return {
      error: "Failed to register school",
    };
  }
}

export async function deleteTestSchool() {
  try {
    // First delete all teachers associated with the test school
    await prisma.teacher.deleteMany({
      where: {
        schoolId: "TEST001",
      },
    });

    // Then delete all students associated with the test school
    await prisma.student.deleteMany({
      where: {
        schoolId: "TEST001",
      },
    });

    // Finally delete the school itself
    const school = await prisma.school.delete({
      where: {
        schoolId: "TEST001",
      },
    });

    return {
      success: true,
      message: "Test school and all related records deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting test school:", error);
    return { error: "Failed to delete test school" };
  }
}
