import { prisma } from "./backend/db";

export async function validateSchool(schoolName: string, schoolId: string) {
  try {
    const school = await prisma.school.findFirst({
      where: {
        AND: [{ schoolName: schoolName }, { schoolId: schoolId }],
      },
    });

    return {
      exists: !!school,
      school,
    };
  } catch (error) {
    console.error("Error validating school:", error);
    throw new Error("Failed to validate school");
  }
}
