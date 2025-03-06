import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateSchool } from "@/lib/school-validation";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      teacherName,
      teacherId,
      schoolName,
      schoolId,
      userId,
      email,
      password,
    } = body;

    // First, validate if the school exists
    const schoolValidation = await validateSchool(schoolName, schoolId);

    if (!schoolValidation.exists) {
      return NextResponse.json(
        { error: "School not found. Please verify school name and ID." },
        { status: 404 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the teacher
    const teacher = await prisma.teacher.create({
      data: {
        teacherName,
        teacherId,
        schoolName,
        schoolId,
        userId,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: "Teacher registered successfully",
      teacher: {
        id: teacher.id,
        teacherName: teacher.teacherName,
        teacherId: teacher.teacherId,
        email: teacher.email,
        schoolName: teacher.schoolName,
      },
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "A teacher with this ID or email already exists." },
        { status: 409 }
      );
    }

    console.error("Error registering teacher:", error);
    return NextResponse.json(
      { error: "Failed to register teacher" },
      { status: 500 }
    );
  }
}
