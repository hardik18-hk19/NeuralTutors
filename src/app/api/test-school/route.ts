import { createTestSchool, deleteTestSchool } from "@/lib/backend/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const result = await createTestSchool();
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in test-school API route:", error);
    return NextResponse.json(
      { error: "Failed to create test school" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const result = await deleteTestSchool();
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in test-school API route:", error);
    return NextResponse.json(
      { error: "Failed to delete test school" },
      { status: 500 }
    );
  }
}
