import { NextResponse } from "next/server";
import { prisma } from "@/lib/backend/db";
import { getSession } from "@/lib/backend/auth";

export async function GET() {
  try {
    const session = await getSession();
    console.log("Session:", session);

    if (!session || session.role !== "school") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const school = await prisma.school.findUnique({
      where: { id: session.id as string },
      select: {
        schoolName: true,
        schoolId: true,
      },
    });
    console.log("Found school:", school);

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const teachers = await prisma.teacher.findMany({
      where: {
        schoolId: school.schoolId,
      },
      select: {
        id: true,
        teacherName: true,
        teacherId: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log("Found teachers:", teachers);

    return NextResponse.json({ school, teachers });
  } catch (error) {
    console.error("Detailed error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Failed to fetch school data" },
      { status: 500 }
    );
  }
}
