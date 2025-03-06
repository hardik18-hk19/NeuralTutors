import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateSchool } from "@/lib/school-validation";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      studentName,
      studentId,
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

    // Create the student
    const student = await prisma.student.create({
      data: {
        studentName,
        studentId,
        schoolName,
        schoolId,
        userId,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: "Student registered successfully",
      student: {
        id: student.id,
        studentName: student.studentName,
        studentId: student.studentId,
        email: student.email,
        schoolName: student.schoolName,
      },
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "A student with this ID or email already exists." },
        { status: 409 }
      );
    }

    console.error("Error registering student:", error);
    return NextResponse.json(
      { error: "Failed to register student" },
      { status: 500 }
    );
  }
}
