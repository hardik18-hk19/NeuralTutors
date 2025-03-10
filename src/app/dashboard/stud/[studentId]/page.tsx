"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/backend/auth";
import { Card } from "@/components/ui/card";
import { UserRound, Mail, IdCard, Calendar } from "lucide-react";

interface StudentData {
  studentName: string;
  studentId: string;
  username: string;
  email: string;
  schoolName: string;
  schoolId: string;
  createdAt: string;
}

export default function StudentDashboard({
  params,
}: {
  params: { studentId: string };
}) {
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (
        !session ||
        session.role !== "student" ||
        session.studentId !== params.studentId
      ) {
        router.push("/auth/login");
        return;
      }
      fetchStudentData();
    };

    checkAuth();
  }, [router, params.studentId]);

  const fetchStudentData = async () => {
    try {
      const response = await fetch(`/api/student/profile`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch student data");
      }

      setStudent(data.student);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch student data"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
          <UserRound className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{student?.studentName}</h1>
          <div className="space-y-1">
            <p className="text-gray-500 dark:text-gray-400">
              Student ID: {student?.studentId}
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Username: {student?.username}
            </p>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Mail className="h-4 w-4" />
            <span>{student?.email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <IdCard className="h-4 w-4" />
            <span>School: {student?.schoolName}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <IdCard className="h-4 w-4" />
            <span>School ID: {student?.schoolId}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Calendar className="h-4 w-4" />
            <span>
              Joined:{" "}
              {student?.createdAt &&
                new Date(student.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
